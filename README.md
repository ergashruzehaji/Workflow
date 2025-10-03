# Workflow Automation System

A practical task automation system with GitHub integration and RESTful APIs designed to maximize work time and efficiency.

## 🚀 Features

- **Task Management**: Create, update, and track tasks with priorities, statuses, and assignments
- **Automated Workflows**: Define and execute automated workflows based on triggers
- **GitHub Integration**: Webhook support for GitHub events (issues, PRs, pushes, releases)
- **RESTful API**: Complete API for programmatic access
- **Data Validation**: Built-in validation and error handling
- **Audit Logging**: Track all changes and actions
- **Statistics**: Get insights into task distribution and workflow performance

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Workflow Examples](#workflow-examples)
- [GitHub Integration](#github-integration)
- [Configuration](#configuration)

## 🎯 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/ergashruzehaji/Workflow.git
cd Workflow

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the server
npm start
```

The server will start at `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Tasks API

#### Create a Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "priority": "high",
  "status": "pending",
  "assigned_to": "john_doe",
  "tags": ["backend", "security"],
  "due_date": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication",
    "priority": "high",
    "status": "pending",
    "assigned_to": "john_doe",
    "tags": ["backend", "security"],
    "due_date": "2024-12-31",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Tasks
```http
GET /api/tasks
GET /api/tasks?status=pending
GET /api/tasks?priority=high&assigned_to=john_doe
GET /api/tasks?limit=10
```

#### Get Task by ID
```http
GET /api/tasks/:id
```

#### Update a Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "urgent"
}
```

#### Delete a Task
```http
DELETE /api/tasks/:id
```

#### Get Task Statistics
```http
GET /api/tasks/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byStatus": {
      "pending": 10,
      "in_progress": 8,
      "completed": 7
    },
    "byPriority": {
      "low": 5,
      "medium": 12,
      "high": 6,
      "urgent": 2
    }
  }
}
```

### Workflows API

#### Create a Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "Auto-assign high priority tasks",
  "description": "Automatically assign high priority tasks to team lead",
  "trigger_type": "task_created",
  "trigger_config": {
    "condition": {
      "field": "priority",
      "operator": "equals",
      "value": "high"
    }
  },
  "action_type": "assign_task",
  "action_config": {
    "task_id": "{{task_id}}",
    "assignee": "team_lead"
  },
  "enabled": true
}
```

#### Get All Workflows
```http
GET /api/workflows
```

#### Get Workflow by ID
```http
GET /api/workflows/:id
```

#### Update a Workflow
```http
PUT /api/workflows/:id
Content-Type: application/json

{
  "enabled": false
}
```

#### Delete a Workflow
```http
DELETE /api/workflows/:id
```

#### Execute a Workflow Manually
```http
POST /api/workflows/:id/execute
Content-Type: application/json

{
  "context": {
    "task_id": "some-task-id",
    "priority": "high"
  }
}
```

#### Trigger Workflows by Type
```http
POST /api/workflows/trigger/:type
Content-Type: application/json

{
  "context": {
    "task_id": "some-task-id",
    "status": "completed"
  }
}
```

### GitHub Webhook

```http
POST /api/github/webhook
X-GitHub-Event: issues
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "action": "opened",
  "issue": { ... }
}
```

## 🔄 Workflow Examples

### Example 1: Auto-Create Task from GitHub Issue

```json
{
  "name": "Create task from GitHub issue",
  "description": "Automatically create a task when a GitHub issue is opened",
  "trigger_type": "github_issue",
  "trigger_config": {
    "condition": {
      "field": "action",
      "operator": "equals",
      "value": "opened"
    }
  },
  "action_type": "create_task",
  "action_config": {
    "title": "GitHub Issue: {{issue_title}}",
    "description": "Issue #{{issue_number}} from {{repository}}",
    "priority": "medium",
    "status": "pending",
    "tags": ["github", "issue"]
  },
  "enabled": true
}
```

### Example 2: Send Notification on Task Completion

```json
{
  "name": "Notify on task completion",
  "description": "Send notification when a task is completed",
  "trigger_type": "task_updated",
  "trigger_config": {
    "condition": {
      "field": "status",
      "operator": "equals",
      "value": "completed"
    }
  },
  "action_type": "send_notification",
  "action_config": {
    "message": "Task '{{title}}' has been completed!"
  },
  "enabled": true
}
```

### Example 3: Auto-Escalate Overdue Tasks

```json
{
  "name": "Escalate overdue tasks",
  "description": "Automatically increase priority of overdue tasks",
  "trigger_type": "scheduled",
  "trigger_config": {
    "schedule": "daily"
  },
  "action_type": "update_task",
  "action_config": {
    "task_id": "{{task_id}}",
    "priority": "urgent"
  },
  "enabled": true
}
```

## 🔗 GitHub Integration

### Setting Up GitHub Webhooks

1. Go to your GitHub repository settings
2. Navigate to **Webhooks** → **Add webhook**
3. Set the Payload URL: `http://your-server:3000/api/github/webhook`
4. Set Content type: `application/json`
5. Set Secret: (use the same value as `GITHUB_WEBHOOK_SECRET` in your `.env`)
6. Select events:
   - Issues
   - Pull requests
   - Pushes
   - Releases
7. Click **Add webhook**

### Supported GitHub Events

- **issues**: Triggered on issue events (opened, closed, assigned, etc.)
- **pull_request**: Triggered on PR events (opened, closed, merged, etc.)
- **push**: Triggered on code pushes
- **release**: Triggered on release events

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000
HOST=localhost

# Database
DB_PATH=./data/workflow.db

# GitHub Webhook
GITHUB_WEBHOOK_SECRET=your_secret_here

# Notifications (optional)
NOTIFICATION_EMAIL=your_email@example.com
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📊 Task Statuses

- `pending`: Task is waiting to be started
- `in_progress`: Task is currently being worked on
- `completed`: Task has been finished
- `cancelled`: Task was cancelled

## 🎯 Task Priorities

- `low`: Low priority task
- `medium`: Medium priority task (default)
- `high`: High priority task
- `urgent`: Urgent task requiring immediate attention

## 🔧 Workflow Trigger Types

- `task_created`: Triggered when a new task is created
- `task_updated`: Triggered when a task is updated
- `task_deleted`: Triggered when a task is deleted
- `github_issue`: Triggered by GitHub issue events
- `github_pr`: Triggered by GitHub pull request events
- `github_push`: Triggered by GitHub push events
- `github_release`: Triggered by GitHub release events
- `scheduled`: Triggered on a schedule (requires additional setup)

## 🎬 Workflow Action Types

- `create_task`: Create a new task
- `update_task`: Update an existing task
- `assign_task`: Assign a task to someone
- `send_notification`: Send a notification

## 💡 Use Cases

1. **Automated Task Assignment**: Automatically assign tasks based on priority or tags
2. **GitHub Issue Tracking**: Create tasks automatically from GitHub issues
3. **PR Review Workflow**: Notify team members when PRs are opened
4. **Release Management**: Create tasks for post-release activities
5. **Task Escalation**: Automatically escalate overdue or high-priority tasks
6. **Team Notifications**: Send notifications on task status changes

## 🏗️ Architecture

```
src/
├── server.js           # Main Express server
├── database.js         # Database management
├── taskService.js      # Task business logic
├── workflowService.js  # Workflow automation logic
└── routes/
    ├── tasks.js        # Task API routes
    ├── workflows.js    # Workflow API routes
    └── github.js       # GitHub webhook routes
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ to maximize work time and efficiency**