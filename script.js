/**
 * Workflow State Machine Implementation
 * 
 * This script implements a state machine for managing workflow processes.
 * It handles state transitions between tasks, manages dependencies,
 * and provides a user interface for interaction.
 */

//=============================================================================
// Constants
//=============================================================================

/** Available states for tasks and workflow */
const STATES = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
};

//=============================================================================
// Link Class - Manages state transitions between components
//=============================================================================

class Link {
    /**
     * Creates a new link between components
     * @param {string} sourceId - ID of the source component
     * @param {string} targetId - ID of the target component
     * @param {string} sourceState - State that triggers the transition
     * @param {string} targetState - State to transition to
     * @param {Function} condition - Optional condition for transition
     */
    constructor(sourceId, targetId, sourceState, targetState, condition = null) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.condition = condition;
    }

    /**
     * Checks if this link should trigger a state transition
     * @param {Object} workflow - Current workflow object
     * @param {string} sourceId - ID of component that changed state
     * @param {string} newState - New state of the component
     * @returns {boolean} Whether transition should occur
     */
    shouldTransition(workflow, sourceId, newState) {
        return this.sourceId === sourceId && 
               this.sourceState === newState && 
               (!this.condition || this.condition(workflow));
    }
}

//=============================================================================
// Task Manager Class - Handles state and action management
//=============================================================================

class TaskManager {
    /**
     * Creates a new TaskManager instance
     * @param {Object} workflow - Workflow configuration object
     */
    constructor(workflow) {
        this.workflow = workflow;
        this.taskStates = new Map();
        this.actionStates = new Map();
        this.links = [];
        this.initializeStates();
    }

    /** Initialize all states to their default values */
    initializeStates() {
        this.taskStates.set(this.workflow.id, STATES.PENDING);
        this.workflow.tasks.forEach(task => {
            this.taskStates.set(task.id, STATES.PENDING);
            task.actions.forEach(action => {
                this.actionStates.set(action.id, false);
            });
        });
    }

    /**
     * Adds a new link to the state machine
     * @param {Link} link - Link object defining state transition
     */
    addLink(link) {
        this.links.push(link);
    }

    /**
     * Checks if a task is completed
     * @param {string} taskId - ID of the task to check
     * @returns {boolean} Whether all actions in the task are completed
     */
    isTaskCompleted(taskId) {
        const task = this.workflow.tasks.find(t => t.id === taskId);
        return task?.actions.every(action => this.actionStates.get(action.id)) ?? false;
    }

    /**
     * Gets the current state of a task
     * @param {string} taskId - ID of the task
     * @returns {string} Current state
     */
    getTaskState(taskId) {
        return this.taskStates.get(taskId);
    }

    /**
     * Gets the current state of an action
     * @param {string} actionId - ID of the action
     * @returns {boolean} Whether action is completed
     */
    getActionState(actionId) {
        return this.actionStates.get(actionId);
    }

    /**
     * Applies state transitions based on links
     * @param {string} sourceId - ID of component that changed
     * @param {string} newState - New state value
     */
    applyStateTransitions(sourceId, newState) {
        this.links.forEach(link => {
            if (link.shouldTransition(this.workflow, sourceId, newState)) {
                this.taskStates.set(link.targetId, link.targetState);
            }
        });
    }

    /**
     * Updates state of a component and applies transitions
     * @param {string} id - Component ID
     * @param {string} newState - New state value
     */
    updateState(id, newState) {
        this.taskStates.set(id, newState);
        this.applyStateTransitions(id, newState);
    }

    /**
     * Toggles an action's state and updates related task states
     * @param {string} actionId - ID of the action to toggle
     */
    toggleAction(actionId) {
        const currentState = this.actionStates.get(actionId);
        this.actionStates.set(actionId, !currentState);
        
        const task = this.workflow.tasks.find(task => 
            task.actions.some(action => action.id === actionId)
        );

        if (task) {
            const completedActions = task.actions.filter(action => 
                this.actionStates.get(action.id)
            ).length;

            let newState;
            if (completedActions === 0) {
                newState = STATES.PENDING;
            } else if (completedActions === task.actions.length) {
                newState = STATES.COMPLETED;
            } else {
                newState = STATES.IN_PROGRESS;
            }

            this.updateState(task.id, newState);
        }
    }

    /** Reset the workflow to initial state */
    resetWorkflow() {
        this.initializeStates();
    }

    /** Check if any action is completed */
    isAnyActionCompleted() {
        return Array.from(this.actionStates.values()).some(state => state === true);
    }

    /** Check and update workflow progress based on actions */
    checkAndUpdateWorkflowProgress() {
        if (this.isAnyActionCompleted() && this.getTaskState(this.workflow.id) === STATES.PENDING) {
            this.updateState(this.workflow.id, STATES.IN_PROGRESS);
        }
    }

    /** Check if entire workflow is completed */
    isWorkflowCompleted() {
        return this.workflow.tasks.every(task => this.isTaskCompleted(task.id));
    }
}

//=============================================================================
// UI Renderer Class - Handles all UI updates and rendering
//=============================================================================

class WorkflowUIRenderer {
    constructor(taskManager, config) {
        this.taskManager = taskManager;
        this.config = config;
    }

    /** Render the workflow state section */
    renderWorkflowState() {
        const workflowState = this.taskManager.getTaskState(this.config.id);
        return `
            <div class="workflow-title">${this.config.name}</div>
            <span class="task-state state-${workflowState}">
                ${workflowState.toUpperCase()}
            </span>
        `;
    }

    /** Render all task states and completion message if applicable */
    renderTaskStates() {
        const isWorkflowComplete = this.taskManager.isWorkflowCompleted();
        
        const completionMessage = isWorkflowComplete ? `
            <div class="completion-message">
                <div class="completion-icon">✓</div>
                <h3>Onboarding Complete!</h3>
                <p>All tasks have been successfully completed.</p>
            </div>
        ` : '';

        const tasksHtml = this.config.tasks.map(task => `
            <div class="task-card">
                <div class="task-name">${task.name}</div>
                <span class="task-state state-${this.taskManager.getTaskState(task.id)}">
                    ${this.taskManager.getTaskState(task.id).toUpperCase()}
                </span>
            </div>
        `).join('');

        return `${completionMessage}${tasksHtml}`;
    }

    /** Render the new profile button when workflow is complete */
    renderNewProfileButton() {
        return this.taskManager.isWorkflowCompleted() ? `
            <div class="new-profile-button-container">
                <button onclick="handleNewProfile()" class="new-profile-button">
                    Add New Profile
                </button>
            </div>
        ` : '';
    }

    /** Render all task action groups */
    renderTaskActions() {
        const isWorkflowCompleted = this.taskManager.isWorkflowCompleted();
        
        return this.config.tasks.map(task => {
            const isAvailable = !isWorkflowCompleted && (
                this.taskManager.isTaskCompleted(task.id) || 
                task.order === 1 || 
                (task.order > 1 && this.taskManager.isTaskCompleted(this.config.tasks[task.order - 2].id))
            );
            const completedActions = task.actions.filter(action => 
                this.taskManager.getActionState(action.id)
            ).length;
            
            return `
                <div class="action-group ${isAvailable ? '' : 'locked'}">
                    <div class="action-title">
                        ${task.name} Actions
                        <span class="action-status">
                            ${completedActions}/${task.actions.length} completed
                        </span>
                    </div>
                    ${this.renderActions(task.actions, isWorkflowCompleted)}
                </div>
            `;
        }).join('');
    }

    /** Render individual actions */
    renderActions(actions, isWorkflowCompleted) {
        return actions.map(action => `
            <div class="action-item">
                <input type="checkbox" 
                    id="${action.id}" 
                    ${this.taskManager.getActionState(action.id) ? 'checked' : ''}
                    ${isWorkflowCompleted ? 'disabled' : ''}
                    onchange="handleActionToggle('${action.id}')"
                >
                <label for="${action.id}" ${isWorkflowCompleted ? 'class="disabled"' : ''}>
                    ${action.name}
                </label>
            </div>
        `).join('');
    }

    /** Update all UI elements */
    updateUI() {
        document.getElementById('workflowState').innerHTML = this.renderWorkflowState();
        document.getElementById('taskStates').innerHTML = 
            this.renderTaskStates() + this.renderNewProfileButton();
        document.getElementById('taskActions').innerHTML = this.renderTaskActions();
    }
}

//=============================================================================
// Workflow Configuration
//=============================================================================

const workflowConfig = {
    id: 'w1',
    name: 'Onboarding',
    tasks: [
        {
            id: 't1',
            name: 'Sign Up',
            order: 1,
            actions: [
                { id: 'a1', name: 'Create Account' },
                { id: 'a2', name: 'Set Password' }
            ]
        },
        {
            id: 't2',
            name: 'Verify Email',
            order: 2,
            actions: [
                { id: 'a3', name: 'Send Verification Email' },
                { id: 'a4', name: 'Confirm Email' }
            ]
        },
        {
            id: 't3',
            name: 'Add Profile',
            order: 3,
            actions: [
                { id: 'a5', name: 'Upload Photo' },
                { id: 'a6', name: 'Fill Basic Info' },
                { id: 'a7', name: 'Add Preferences' }
            ]
        }
    ]
};

//=============================================================================
// Initialize Application
//=============================================================================

// Create instances
const taskManager = new TaskManager(workflowConfig);
const uiRenderer = new WorkflowUIRenderer(taskManager, workflowConfig);

// Set up state transition links
taskManager.addLink(new Link(
    'w1', 't1', 
    STATES.IN_PROGRESS, 
    STATES.IN_PROGRESS
));

taskManager.addLink(new Link(
    't1', 't2',
    STATES.COMPLETED,
    STATES.IN_PROGRESS
));

taskManager.addLink(new Link(
    't2', 't3',
    STATES.COMPLETED,
    STATES.IN_PROGRESS
));

// Conditional link for workflow completion
taskManager.addLink(new Link(
    't3', 'w1',
    STATES.COMPLETED,
    STATES.COMPLETED,
    (workflow) => workflow.tasks.every(task => 
        taskManager.getTaskState(task.id) === STATES.COMPLETED
    )
));

//=============================================================================
// Event Handlers
//=============================================================================

/** Handle action checkbox toggles */
function handleActionToggle(actionId) {
    taskManager.toggleAction(actionId);
    taskManager.checkAndUpdateWorkflowProgress();
    uiRenderer.updateUI();
}

/** Handle new profile button click */
function handleNewProfile() {
    taskManager.resetWorkflow();
    uiRenderer.updateUI();
}

// Initialize UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    uiRenderer.updateUI();
});