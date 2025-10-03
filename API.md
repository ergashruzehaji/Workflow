# API Reference

Complete API reference for the Workflow Automation System.

Base URL: `http://localhost:3000/api`

## Table of Contents
- [Authentication](#authentication)
- [Tasks API](#tasks-api)
- [Workflows API](#workflows-api)
- [GitHub Webhooks](#github-webhooks)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

---

## Authentication

**Current Version:** No authentication required (v1.0.0)

Future versions will include JWT-based authentication.

---

## Tasks API

### List All Tasks

**Endpoint:** `GET /api/tasks`

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `assigned_to` (optional): Filter by assignee
- `limit` (optional): Limit number of results

**Example Request:**
```bash
curl http://localhost:3000/api/tasks?status=pending&priority=high
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "priority": "high",
      "assigned_to": "john_doe",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "due_date": "2024-12-31",
      "tags": ["backend", "security"]
    }
  ]
}
```

---

### Get Single Task

**Endpoint:** `GET /api/tasks/:id`

**Example Request:**
```bash
curl http://localhost:3000/api/tasks/uuid-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "assigned_to": "john_doe",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "due_date": "2024-12-31",
    "tags": ["backend", "security"]
  }
}
```

---

### Create Task

**Endpoint:** `POST /api/tasks`

**Request Body:**
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "priority": "high",
  "status": "pending",
  "assigned_to": "john_doe",
  "due_date": "2024-12-31",
  "tags": ["tag1", "tag2"]
}
```

**Field Validation:**
- `title`: Required, max 200 characters
- `status`: One of: pending, in_progress, completed, cancelled
- `priority`: One of: low, medium, high, urgent
- `assigned_to`: Optional string
- `due_date`: Optional ISO date string
- `tags`: Optional array of strings

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature X",
    "description": "Add new feature",
    "priority": "high",
    "status": "pending",
    "assigned_to": "john_doe",
    "tags": ["feature", "backend"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "title": "Implement feature X",
    ...
  }
}
```

---

### Update Task

**Endpoint:** `PUT /api/tasks/:id`

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": "jane_smith",
  "due_date": "2024-12-31",
  "tags": ["updated", "tags"]
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/tasks/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    ...
  }
}
```

---

### Delete Task

**Endpoint:** `DELETE /api/tasks/:id`

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/uuid-here
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Get Task Statistics

**Endpoint:** `GET /api/tasks/stats/summary`

**Example Request:**
```bash
curl http://localhost:3000/api/tasks/stats/summary
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

---

## Workflows API

### List All Workflows

**Endpoint:** `GET /api/workflows`

**Example Request:**
```bash
curl http://localhost:3000/api/workflows
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid",
      "name": "Workflow name",
      "description": "Workflow description",
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
        "assignee": "team_lead"
      },
      "enabled": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Single Workflow

**Endpoint:** `GET /api/workflows/:id`

**Example Request:**
```bash
curl http://localhost:3000/api/workflows/uuid-here
```

---

### Create Workflow

**Endpoint:** `POST /api/workflows`

**Request Body:**
```json
{
  "name": "Workflow name (required)",
  "description": "Workflow description (optional)",
  "trigger_type": "task_created",
  "trigger_config": {
    "condition": {
      "field": "priority",
      "operator": "equals",
      "value": "high"
    }
  },
  "action_type": "create_task",
  "action_config": {
    "title": "New task: {{title}}",
    "priority": "high"
  },
  "enabled": true
}
```

**Trigger Types:**
- `task_created`: When a task is created
- `task_updated`: When a task is updated
- `task_deleted`: When a task is deleted
- `github_issue`: GitHub issue event
- `github_pr`: GitHub pull request event
- `github_push`: GitHub push event
- `github_release`: GitHub release event
- `scheduled`: Scheduled trigger (future)

**Action Types:**
- `create_task`: Create a new task
- `update_task`: Update existing task
- `assign_task`: Assign task to someone
- `send_notification`: Send notification

**Condition Operators:**
- `equals`: Field equals value
- `not_equals`: Field does not equal value
- `contains`: Field contains value

**Template Variables:**
Use `{{variable_name}}` in action config to interpolate context values.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto-assign high priority",
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
  }'
```

---

### Update Workflow

**Endpoint:** `PUT /api/workflows/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated name",
  "enabled": false
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/workflows/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

### Delete Workflow

**Endpoint:** `DELETE /api/workflows/:id`

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/workflows/uuid-here
```

---

### Execute Workflow Manually

**Endpoint:** `POST /api/workflows/:id/execute`

**Request Body:**
```json
{
  "context": {
    "task_id": "some-task-id",
    "title": "Task title",
    "priority": "high"
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/workflows/uuid-here/execute \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "task_id": "task-uuid",
      "priority": "high"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "workflow_id": "uuid",
  "workflow_name": "Workflow name",
  "result": {
    "id": "new-task-id",
    "title": "Created task"
  }
}
```

---

### Trigger Workflows by Type

**Endpoint:** `POST /api/workflows/trigger/:type`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/workflows/trigger/task_created \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "task_id": "task-uuid",
      "priority": "high",
      "title": "New task"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "triggered": 2,
  "results": [
    {
      "success": true,
      "workflow_id": "uuid1",
      "workflow_name": "Workflow 1",
      "result": {...}
    },
    {
      "success": true,
      "workflow_id": "uuid2",
      "workflow_name": "Workflow 2",
      "result": {...}
    }
  ]
}
```

---

## GitHub Webhooks

### Webhook Endpoint

**Endpoint:** `POST /api/github/webhook`

**Headers:**
- `X-GitHub-Event`: Event type (issues, pull_request, push, release)
- `X-Hub-Signature-256`: HMAC signature (if secret configured)

**Configuration:**
1. Set webhook secret in `.env`: `GITHUB_WEBHOOK_SECRET=your_secret`
2. Configure GitHub webhook with the same secret
3. Select events: Issues, Pull requests, Pushes, Releases

**Supported Events:**
- `issues`: Issue opened, closed, assigned, etc.
- `pull_request`: PR opened, closed, merged, etc.
- `push`: Code pushed to repository
- `release`: Release published, created, etc.

**Example Payload** (GitHub sends this):
```json
{
  "action": "opened",
  "issue": {
    "number": 123,
    "title": "Bug in feature X",
    "state": "open"
  },
  "repository": {
    "full_name": "user/repo"
  },
  "sender": {
    "login": "username"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received",
  "event": "issues"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST (resource created)
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Errors

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed: Title is required"
}
```

**Not Found:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

**Invalid Priority:**
```json
{
  "success": false,
  "error": "Validation failed: Priority must be one of: low, medium, high, urgent"
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### List Response

```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

### Delete Response

```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

---

## Rate Limiting

**Current Version:** No rate limiting (v1.0.0)

Future versions will include configurable rate limiting.

---

## Pagination

**Current Version:** Basic limit parameter (v1.0.0)

Future versions will include proper cursor-based pagination.

---

## Additional Resources

- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Quick setup guide
- [examples/workflow-templates.json](examples/workflow-templates.json) - Workflow examples
- [examples/usage.js](examples/usage.js) - Usage examples

---

For support, please open a GitHub issue.
