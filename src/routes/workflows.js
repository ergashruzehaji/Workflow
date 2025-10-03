const express = require('express');
const router = express.Router();

function createWorkflowRoutes(workflowService) {
  // Get all workflows
  router.get('/', (req, res) => {
    try {
      const workflows = workflowService.getAllWorkflows();
      res.json({
        success: true,
        count: workflows.length,
        data: workflows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get workflow by ID
  router.get('/:id', (req, res) => {
    try {
      const workflow = workflowService.getWorkflow(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
      }
      
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create a new workflow
  router.post('/', (req, res) => {
    try {
      const workflow = workflowService.createWorkflow(req.body);
      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update a workflow
  router.put('/:id', (req, res) => {
    try {
      const workflow = workflowService.updateWorkflow(req.params.id, req.body);
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      const status = error.message === 'Workflow not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete a workflow
  router.delete('/:id', (req, res) => {
    try {
      const result = workflowService.deleteWorkflow(req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.message === 'Workflow not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  // Execute a workflow manually
  router.post('/:id/execute', (req, res) => {
    try {
      const result = workflowService.executeWorkflow(req.params.id, req.body.context || {});
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Trigger workflows by type
  router.post('/trigger/:type', (req, res) => {
    try {
      const results = workflowService.triggerWorkflows(req.params.type, req.body.context || {});
      res.json({
        success: true,
        triggered: results.length,
        results
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

module.exports = createWorkflowRoutes;
