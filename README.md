# State Machine Workflow Engine

## Overview
An interactive state machine implementation that demonstrates workflow management through a user-friendly web interface. The system manages state transitions between tasks and provides visual feedback of the workflow progress.

## Features
- State management for workflow and tasks
- Sequential task unlocking
- Interactive UI with checkboxes and state indicators
- Visual state representation
- Automatic state transitions
- Reset functionality

## Live Demo Features
- **Workflow States**: Pending → In Progress → Completed
- **Tasks**:
  1. Sign Up
     - Create Account
     - Set Password
  2. Email Verification
     - Send Verification Email
     - Confirm Email
  3. Profile Setup
     - Upload Photo
     - Fill Basic Info
     - Add Preferences

## Implementation Details

### Core Components
1. **State Machine**
   - Manages state transitions
   - Handles task dependencies
   - Controls workflow progression

2. **Link System**
   - Defines relationships between components
   - Manages state transition rules
   - Handles conditional state changes

3. **UI Renderer**
   - Provides visual feedback
   - Handles user interactions
   - Updates display in real-time

### State Transitions
- Tasks progress through three states:
  - `PENDING`: Initial state
  - `IN_PROGRESS`: Task started
  - `COMPLETED`: All actions done

## Setup and Running

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   ```

2. **Project Structure**
   ```
   project/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── LICENSE
   └── README.md
   ```

3. **Running the Application**
   - Open `index.html` in a web browser
   - No server required
   - Works in any modern browser

## Usage

1. **Initial State**
   - All tasks start in `PENDING` state
   - Only the first task's actions are available

2. **Task Progression**
   - Complete actions by checking checkboxes
   - Tasks automatically progress based on completed actions
   - The next task unlocks when the current task is completed

3. **Workflow Completion**
   - Workflow completes when all tasks are done
   - The "Add New Profile" button appears
   - System can be reset to the initial state

## State Transition Rules

1. **Task State Changes**
   - First action → Task becomes `IN_PROGRESS`
   - All actions complete → Task becomes `COMPLETED`
   - Task completion unlocks the next task

2. **Workflow State Changes**
   - First action → Workflow becomes `IN_PROGRESS`
   - All tasks complete → Workflow becomes `COMPLETED`

## Extension Points

The system can be extended by:
1. Adding new tasks and actions
2. Modifying state transition rules
3. Adding new state types
4. Implementing additional workflows

## Code Examples

### Adding a New Task
```javascript
const newTask = {
    id: 't4',
    name: 'New Task',
    order: 4,
    actions: [
        { id: 'a8', name: 'New Action 1' },
        { id: 'a9', name: 'New Action 2' }
    ]
};
workflowConfig.tasks.push(newTask);
```

### Adding a New Link
```javascript
taskManager.addLink(new Link(
    'sourceTaskId',
    'targetTaskId',
    'completed',
    'in-progress'
));
```

