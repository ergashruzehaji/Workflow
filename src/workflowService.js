const { v4: uuidv4 } = require('uuid');

class WorkflowService {
  constructor(db, taskService) {
    this.db = db;
    this.taskService = taskService;
  }

  createWorkflow(workflowData) {
    const id = uuidv4();
    const workflow = {
      id,
      name: workflowData.name,
      description: workflowData.description || '',
      trigger_type: workflowData.trigger_type,
      trigger_config: JSON.stringify(workflowData.trigger_config || {}),
      action_type: workflowData.action_type,
      action_config: JSON.stringify(workflowData.action_config || {}),
      enabled: workflowData.enabled !== undefined ? (workflowData.enabled ? 1 : 0) : 1
    };

    const stmt = this.db.prepare(`
      INSERT INTO workflows (id, name, description, trigger_type, trigger_config, action_type, action_config, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      workflow.id,
      workflow.name,
      workflow.description,
      workflow.trigger_type,
      workflow.trigger_config,
      workflow.action_type,
      workflow.action_config,
      workflow.enabled
    );

    return this.getWorkflow(id);
  }

  getWorkflow(id) {
    const stmt = this.db.prepare('SELECT * FROM workflows WHERE id = ?');
    const workflow = stmt.get(id);
    
    if (workflow) {
      workflow.trigger_config = JSON.parse(workflow.trigger_config);
      workflow.action_config = JSON.parse(workflow.action_config);
      workflow.enabled = Boolean(workflow.enabled);
    }
    
    return workflow;
  }

  getAllWorkflows() {
    const stmt = this.db.prepare('SELECT * FROM workflows ORDER BY created_at DESC');
    const workflows = stmt.all();

    return workflows.map(workflow => {
      workflow.trigger_config = JSON.parse(workflow.trigger_config);
      workflow.action_config = JSON.parse(workflow.action_config);
      workflow.enabled = Boolean(workflow.enabled);
      return workflow;
    });
  }

  updateWorkflow(id, updates) {
    const existingWorkflow = this.getWorkflow(id);
    if (!existingWorkflow) {
      throw new Error('Workflow not found');
    }

    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.trigger_type !== undefined) {
      fields.push('trigger_type = ?');
      values.push(updates.trigger_type);
    }
    if (updates.trigger_config !== undefined) {
      fields.push('trigger_config = ?');
      values.push(JSON.stringify(updates.trigger_config));
    }
    if (updates.action_type !== undefined) {
      fields.push('action_type = ?');
      values.push(updates.action_type);
    }
    if (updates.action_config !== undefined) {
      fields.push('action_config = ?');
      values.push(JSON.stringify(updates.action_config));
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }

    values.push(id);

    const stmt = this.db.prepare(
      `UPDATE workflows SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    return this.getWorkflow(id);
  }

  deleteWorkflow(id) {
    const workflow = this.getWorkflow(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const stmt = this.db.prepare('DELETE FROM workflows WHERE id = ?');
    stmt.run(id);

    return { success: true, message: 'Workflow deleted successfully' };
  }

  // Execute workflow when triggered
  executeWorkflow(workflowId, context = {}) {
    const workflow = this.getWorkflow(workflowId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.enabled) {
      return { success: false, message: 'Workflow is disabled' };
    }

    try {
      let result;

      switch (workflow.action_type) {
        case 'create_task':
          result = this.executeCreateTask(workflow.action_config, context);
          break;
        case 'update_task':
          result = this.executeUpdateTask(workflow.action_config, context);
          break;
        case 'assign_task':
          result = this.executeAssignTask(workflow.action_config, context);
          break;
        case 'send_notification':
          result = this.executeSendNotification(workflow.action_config, context);
          break;
        default:
          throw new Error(`Unknown action type: ${workflow.action_type}`);
      }

      return {
        success: true,
        workflow_id: workflowId,
        workflow_name: workflow.name,
        result
      };
    } catch (error) {
      return {
        success: false,
        workflow_id: workflowId,
        error: error.message
      };
    }
  }

  executeCreateTask(config, context) {
    const taskData = {
      title: this.interpolate(config.title, context),
      description: this.interpolate(config.description, context),
      status: config.status || 'pending',
      priority: config.priority || 'medium',
      assigned_to: this.interpolate(config.assigned_to, context),
      tags: config.tags || []
    };

    return this.taskService.createTask(taskData);
  }

  executeUpdateTask(config, context) {
    const taskId = this.interpolate(config.task_id, context);
    const updates = {};

    if (config.status) updates.status = config.status;
    if (config.priority) updates.priority = config.priority;
    if (config.assigned_to) updates.assigned_to = this.interpolate(config.assigned_to, context);

    return this.taskService.updateTask(taskId, updates);
  }

  executeAssignTask(config, context) {
    const taskId = this.interpolate(config.task_id, context);
    const assignee = this.interpolate(config.assignee, context);

    return this.taskService.updateTask(taskId, { assigned_to: assignee });
  }

  executeSendNotification(config, context) {
    const message = this.interpolate(config.message, context);
    
    const notificationId = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO notifications (id, task_id, message, status)
      VALUES (?, ?, ?, 'sent')
    `);
    
    stmt.run(notificationId, config.task_id || null, message);

    return {
      id: notificationId,
      message,
      status: 'sent'
    };
  }

  // Simple template interpolation
  interpolate(template, context) {
    if (!template) return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
  }

  // Trigger workflows based on events
  triggerWorkflows(triggerType, context = {}) {
    const stmt = this.db.prepare(
      'SELECT * FROM workflows WHERE trigger_type = ? AND enabled = 1'
    );
    const workflows = stmt.all(triggerType);

    const results = [];
    for (const workflow of workflows) {
      workflow.trigger_config = JSON.parse(workflow.trigger_config);
      workflow.action_config = JSON.parse(workflow.action_config);

      // Check if trigger conditions are met
      if (this.shouldTrigger(workflow, context)) {
        const result = this.executeWorkflow(workflow.id, context);
        results.push(result);
      }
    }

    return results;
  }

  shouldTrigger(workflow, context) {
    const config = workflow.trigger_config;

    // Simple condition checking
    if (config.condition) {
      const { field, operator, value } = config.condition;
      const contextValue = context[field];

      switch (operator) {
        case 'equals':
          return contextValue === value;
        case 'not_equals':
          return contextValue !== value;
        case 'contains':
          return contextValue && contextValue.includes(value);
        default:
          return true;
      }
    }

    return true;
  }
}

module.exports = WorkflowService;
