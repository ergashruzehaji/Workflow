# Quick Setup Guide

## Prerequisites

- Node.js v16 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ergashruzehaji/Workflow.git
   cd Workflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env to customize settings
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Or use the quick start script:
   ```bash
   ./start.sh
   ```

The server will start at `http://localhost:3000`

## Quick Test

Run the interactive demo to test all features:
```bash
# In one terminal, start the server:
npm start

# In another terminal, run the demo:
./demo.sh
```

## First API Calls

### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My first task",
    "description": "Getting started with workflow automation",
    "priority": "high",
    "status": "pending"
  }'
```

### Get all tasks
```bash
curl http://localhost:3000/api/tasks
```

### View API documentation
Open your browser to: `http://localhost:3000`

## GitHub Webhook Setup (Optional)

1. Go to your GitHub repository settings
2. Navigate to Webhooks → Add webhook
3. Set Payload URL: `http://your-server:3000/api/github/webhook`
4. Set Content type: `application/json`
5. Set Secret: (same as `GITHUB_WEBHOOK_SECRET` in `.env`)
6. Select events: Issues, Pull requests, Pushes, Releases
7. Click Add webhook

## Development Mode

For auto-restart on file changes:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Common Issues

### Port already in use
Change the port in `.env`:
```
PORT=3001
```

### Database locked
Stop all running instances and delete `data/workflow.db-wal` and `data/workflow.db-shm`

## Next Steps

1. Read the full [README.md](README.md) for complete API documentation
2. Explore [examples/workflow-templates.json](examples/workflow-templates.json) for workflow ideas
3. Set up GitHub webhooks for automated task creation
4. Customize workflows for your team's needs

## Support

For issues or questions, please open a GitHub issue.
