require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const DatabaseManager = require('./database');
const TaskService = require('./taskService');
const WorkflowService = require('./workflowService');
const createTaskRoutes = require('./routes/tasks');
const createWorkflowRoutes = require('./routes/workflows');
const createGithubRoutes = require('./routes/github');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database and services
const dbPath = process.env.DB_PATH || './data/workflow.db';
const dbManager = new DatabaseManager(dbPath);
const taskService = new TaskService(dbManager.db);
const workflowService = new WorkflowService(dbManager.db, taskService);

// API Routes
app.use('/api/tasks', createTaskRoutes(taskService));
app.use('/api/workflows', createWorkflowRoutes(workflowService));
app.use('/api/github', createGithubRoutes(workflowService));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Workflow Automation System API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      workflows: '/api/workflows',
      github_webhook: '/api/github/webhook'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     Workflow Automation System - Server Started           ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://${HOST}:${PORT}                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
║  Database: ${dbPath}                              ║
╠════════════════════════════════════════════════════════════╣
║  API Endpoints:                                            ║
║    - Tasks:     http://${HOST}:${PORT}/api/tasks              ║
║    - Workflows: http://${HOST}:${PORT}/api/workflows         ║
║    - GitHub:    http://${HOST}:${PORT}/api/github/webhook    ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    dbManager.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    dbManager.close();
    process.exit(0);
  });
});

module.exports = app;
