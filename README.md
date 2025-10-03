# Workflow Automation API

A Flask-based REST API for workflow automation, maximizing work time and efficiency through intelligent task management and automated workflows.

## Features

- 🔐 **API Key Authentication**: Secure endpoints with simple API key authentication
- 🤖 **Automated Task Assignment**: Auto-assign tasks to teams based on task type
- 📅 **Smart Due Date Calculation**: Automatically calculate due dates based on priority
- ✅ **Input Validation**: Comprehensive validation to reduce errors
- 📊 **Statistics Dashboard**: Track automation effectiveness and time saved
- 🔄 **Custom Workflows**: Create automated workflows with custom triggers and actions

## Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ergashruzehaji/Workflow.git
cd Workflow
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Environment Variables

- `API_KEY`: Set your API key (default: `dev-key-12345`)

```bash
export API_KEY=your-secret-api-key
python app.py
```

## API Endpoints

### Health Check

```bash
curl http://localhost:5000/health
```

### Create Task (with automation)

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "X-API-Key: dev-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login bug",
    "type": "bug",
    "priority": "high",
    "description": "Users cannot login"
  }'
```

**Automated Actions:**
- Task is auto-assigned to appropriate team based on type
- Due date is calculated based on priority (high: 1 day, medium: 3 days, low: 7 days)

**Task Types → Team Assignments:**
- `bug` → `dev-team`
- `feature` → `product-team`
- `documentation` → `docs-team`
- `other` → `general-team`

### Get All Tasks

```bash
# Get all tasks
curl -H "X-API-Key: dev-key-12345" http://localhost:5000/api/tasks

# Filter by status
curl -H "X-API-Key: dev-key-12345" "http://localhost:5000/api/tasks?status=open"

# Filter by assigned team
curl -H "X-API-Key: dev-key-12345" "http://localhost:5000/api/tasks?assigned_to=dev-team"
```

### Get Specific Task

```bash
curl -H "X-API-Key: dev-key-12345" http://localhost:5000/api/tasks/1
```

### Update Task

```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "X-API-Key: dev-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assigned_to": "dev-team"
  }'
```

### Create Workflow

```bash
curl -X POST http://localhost:5000/api/workflows \
  -H "X-API-Key: dev-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto-close old tasks",
    "trigger": "task_age > 30 days",
    "actions": ["close_task", "send_notification"]
  }'
```

### Get All Workflows

```bash
curl -H "X-API-Key: dev-key-12345" http://localhost:5000/api/workflows
```

### Get Automation Statistics

```bash
curl -H "X-API-Key: dev-key-12345" http://localhost:5000/api/stats
```

**Response includes:**
- Total tasks count
- Auto-assigned tasks count
- Automation rate percentage
- Tasks breakdown by status
- Tasks breakdown by team
- Estimated time saved (5 min per task)
- Error reduction rate (95% based on validation)

## Task Fields

### Required Fields
- `title`: Task title (string)
- `type`: Task type (`bug`, `feature`, `documentation`, `other`)
- `priority`: Priority level (`high`, `medium`, `low`)

### Optional Fields
- `description`: Detailed description of the task

### Auto-Generated Fields
- `id`: Unique task identifier
- `status`: Current status (default: `open`)
- `assigned_to`: Auto-assigned team based on type
- `due_date`: Auto-calculated based on priority
- `created_at`: Task creation timestamp
- `updated_at`: Last update timestamp (on updates)

## Testing

Run the test suite:

```bash
python -m unittest test_app.py
```

Or with verbose output:

```bash
python -m unittest test_app.py -v
```

## Error Handling

The API provides comprehensive error messages:

### Missing Required Fields
```json
{
  "errors": [
    "Missing required field: title",
    "Missing required field: type"
  ]
}
```

### Invalid Values
```json
{
  "errors": [
    "Invalid type. Must be one of: ['bug', 'feature', 'documentation', 'other']",
    "Invalid priority. Must be one of: ['high', 'medium', 'low']"
  ]
}
```

### Authentication Error
```json
{
  "error": "Invalid API key"
}
```

### Not Found
```json
{
  "error": "Task not found"
}
```

## Production Considerations

⚠️ This implementation uses in-memory storage for simplicity. For production use:

1. **Use a Database**: Replace in-memory storage with PostgreSQL, MySQL, or MongoDB
2. **Secure API Keys**: Use environment variables and secure key management
3. **Add Rate Limiting**: Protect against abuse
4. **Enable HTTPS**: Use SSL/TLS certificates
5. **Add Logging**: Implement comprehensive logging
6. **Add Monitoring**: Set up health checks and metrics
7. **Implement CORS**: Configure CORS for web clients
8. **Add Pagination**: For large result sets
9. **Background Jobs**: Use Celery or similar for async tasks

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
