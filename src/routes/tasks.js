const express = require('express');
const router = express.Router();

function createTaskRoutes(taskService) {
  // Get all tasks
  router.get('/', (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assigned_to: req.query.assigned_to,
        limit: req.query.limit
      };
      
      const tasks = taskService.getAllTasks(filters);
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get task by ID
  router.get('/:id', (req, res) => {
    try {
      const task = taskService.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create a new task
  router.post('/', (req, res) => {
    try {
      const task = taskService.createTask(req.body);
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update a task
  router.put('/:id', (req, res) => {
    try {
      const task = taskService.updateTask(req.params.id, req.body);
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      const status = error.message === 'Task not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete a task
  router.delete('/:id', (req, res) => {
    try {
      const result = taskService.deleteTask(req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.message === 'Task not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get task statistics
  router.get('/stats/summary', (req, res) => {
    try {
      const stats = taskService.getTaskStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = createTaskRoutes;
