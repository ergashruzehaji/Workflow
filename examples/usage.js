#!/usr/bin/env node

/**
 * Example usage script for the Workflow Automation System
 * This demonstrates how to use the API programmatically
 */

const baseUrl = process.env.API_URL || 'http://localhost:3000';

async function makeRequest(method, endpoint, data = null) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error making ${method} request to ${endpoint}:`, error.message);
    throw error;
  }
}

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Workflow Automation System - Usage Examples');
  console.log('='.repeat(60));
  console.log('');

  // Example 1: Create a task
  console.log('1. Creating a new task...');
  const newTask = await makeRequest('POST', '/api/tasks', {
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication to the API',
    priority: 'high',
    status: 'pending',
    assigned_to: 'john_doe',
    tags: ['backend', 'security'],
    due_date: '2024-12-31'
  });
  console.log('✓ Task created:', newTask.data.id);
  console.log('');

  const taskId = newTask.data.id;

  // Example 2: Get all tasks
  console.log('2. Fetching all tasks...');
  const allTasks = await makeRequest('GET', '/api/tasks');
  console.log(`✓ Found ${allTasks.count} tasks`);
  console.log('');

  // Example 3: Update a task
  console.log('3. Updating task status...');
  const updatedTask = await makeRequest('PUT', `/api/tasks/${taskId}`, {
    status: 'in_progress'
  });
  console.log('✓ Task updated:', updatedTask.data.status);
  console.log('');

  // Example 4: Get task statistics
  console.log('4. Getting task statistics...');
  const stats = await makeRequest('GET', '/api/tasks/stats/summary');
  console.log('✓ Statistics:', JSON.stringify(stats.data, null, 2));
  console.log('');

  // Example 5: Create a workflow
  console.log('5. Creating an automated workflow...');
  const newWorkflow = await makeRequest('POST', '/api/workflows', {
    name: 'Auto-assign high priority tasks',
    description: 'Automatically assign high priority tasks to team lead',
    trigger_type: 'task_created',
    trigger_config: {
      condition: {
        field: 'priority',
        operator: 'equals',
        value: 'high'
      }
    },
    action_type: 'assign_task',
    action_config: {
      task_id: '{{task_id}}',
      assignee: 'team_lead'
    },
    enabled: true
  });
  console.log('✓ Workflow created:', newWorkflow.data.id);
  console.log('');

  const workflowId = newWorkflow.data.id;

  // Example 6: Execute a workflow
  console.log('6. Executing workflow manually...');
  const executionResult = await makeRequest('POST', `/api/workflows/${workflowId}/execute`, {
    context: {
      task_id: taskId,
      priority: 'high'
    }
  });
  console.log('✓ Workflow executed:', executionResult.success);
  console.log('');

  // Example 7: Get all workflows
  console.log('7. Fetching all workflows...');
  const allWorkflows = await makeRequest('GET', '/api/workflows');
  console.log(`✓ Found ${allWorkflows.count} workflows`);
  console.log('');

  // Example 8: Create another task to test filtering
  console.log('8. Creating another task with different priority...');
  const anotherTask = await makeRequest('POST', '/api/tasks', {
    title: 'Update documentation',
    description: 'Update API documentation',
    priority: 'low',
    status: 'pending',
    assigned_to: 'jane_smith',
    tags: ['documentation']
  });
  console.log('✓ Task created:', anotherTask.data.id);
  console.log('');

  // Example 9: Filter tasks by priority
  console.log('9. Filtering tasks by priority...');
  const highPriorityTasks = await makeRequest('GET', '/api/tasks?priority=high');
  console.log(`✓ Found ${highPriorityTasks.count} high-priority tasks`);
  console.log('');

  // Example 10: Filter tasks by status
  console.log('10. Filtering tasks by status...');
  const pendingTasks = await makeRequest('GET', '/api/tasks?status=pending');
  console.log(`✓ Found ${pendingTasks.count} pending tasks`);
  console.log('');

  console.log('='.repeat(60));
  console.log('All examples completed successfully! ✓');
  console.log('='.repeat(60));
}

// Run examples if this script is executed directly
if (require.main === module) {
  runExamples().catch(error => {
    console.error('Error running examples:', error);
    process.exit(1);
  });
}

module.exports = { runExamples, makeRequest };
