import unittest
import json
from app import app, tasks, workflows, task_id_counter, workflow_id_counter

class WorkflowAPITestCase(unittest.TestCase):
    
    def setUp(self):
        """Set up test client and clear data"""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.api_key = 'dev-key-12345'
        self.headers = {'X-API-Key': self.api_key}
        
        # Clear data
        tasks.clear()
        workflows.clear()
        global task_id_counter, workflow_id_counter
        app.task_id_counter = 1
        app.workflow_id_counter = 1
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['version'], '1.0.0')
        self.assertIn('timestamp', data)
    
    def test_create_task_without_api_key(self):
        """Test creating task without API key returns 401"""
        task_data = {
            'title': 'Test Task',
            'type': 'bug',
            'priority': 'high'
        }
        response = self.client.post('/api/tasks',
                                   data=json.dumps(task_data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 401)
    
    def test_create_task_with_valid_data(self):
        """Test creating a task with valid data"""
        task_data = {
            'title': 'Fix critical bug',
            'type': 'bug',
            'priority': 'high',
            'description': 'This is a critical bug'
        }
        response = self.client.post('/api/tasks',
                                   data=json.dumps(task_data),
                                   content_type='application/json',
                                   headers=self.headers)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Task created and auto-assigned')
        self.assertEqual(data['task']['title'], 'Fix critical bug')
        self.assertEqual(data['task']['assigned_to'], 'dev-team')
        self.assertIn('due_date', data['task'])
        self.assertTrue(data['automation_applied']['auto_assigned'])
        self.assertTrue(data['automation_applied']['due_date_calculated'])
    
    def test_create_task_with_missing_fields(self):
        """Test creating task with missing required fields"""
        task_data = {
            'title': 'Incomplete Task'
        }
        response = self.client.post('/api/tasks',
                                   data=json.dumps(task_data),
                                   content_type='application/json',
                                   headers=self.headers)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('errors', data)
    
    def test_create_task_with_invalid_type(self):
        """Test creating task with invalid type"""
        task_data = {
            'title': 'Test Task',
            'type': 'invalid_type',
            'priority': 'high'
        }
        response = self.client.post('/api/tasks',
                                   data=json.dumps(task_data),
                                   content_type='application/json',
                                   headers=self.headers)
        self.assertEqual(response.status_code, 400)
    
    def test_auto_assignment(self):
        """Test automatic task assignment based on type"""
        test_cases = [
            ('bug', 'dev-team'),
            ('feature', 'product-team'),
            ('documentation', 'docs-team'),
            ('other', 'general-team')
        ]
        
        for task_type, expected_team in test_cases:
            task_data = {
                'title': f'Test {task_type} task',
                'type': task_type,
                'priority': 'medium'
            }
            response = self.client.post('/api/tasks',
                                       data=json.dumps(task_data),
                                       content_type='application/json',
                                       headers=self.headers)
            data = json.loads(response.data)
            self.assertEqual(data['task']['assigned_to'], expected_team)
    
    def test_get_tasks(self):
        """Test getting all tasks"""
        # Create some tasks first
        for i in range(3):
            task_data = {
                'title': f'Task {i}',
                'type': 'bug',
                'priority': 'low'
            }
            self.client.post('/api/tasks',
                           data=json.dumps(task_data),
                           content_type='application/json',
                           headers=self.headers)
        
        response = self.client.get('/api/tasks', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['count'], 3)
    
    def test_get_task_by_id(self):
        """Test getting a specific task by ID"""
        # Create a task
        task_data = {
            'title': 'Specific Task',
            'type': 'feature',
            'priority': 'high'
        }
        create_response = self.client.post('/api/tasks',
                                          data=json.dumps(task_data),
                                          content_type='application/json',
                                          headers=self.headers)
        created_task = json.loads(create_response.data)['task']
        task_id = created_task['id']
        
        # Get the task
        response = self.client.get(f'/api/tasks/{task_id}', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Specific Task')
    
    def test_get_nonexistent_task(self):
        """Test getting a task that doesn't exist"""
        response = self.client.get('/api/tasks/999', headers=self.headers)
        self.assertEqual(response.status_code, 404)
    
    def test_update_task(self):
        """Test updating a task"""
        # Create a task
        task_data = {
            'title': 'Task to Update',
            'type': 'bug',
            'priority': 'low'
        }
        create_response = self.client.post('/api/tasks',
                                          data=json.dumps(task_data),
                                          content_type='application/json',
                                          headers=self.headers)
        created_task = json.loads(create_response.data)['task']
        task_id = created_task['id']
        
        # Update the task
        update_data = {
            'status': 'in_progress',
            'priority': 'high'
        }
        response = self.client.patch(f'/api/tasks/{task_id}',
                                    data=json.dumps(update_data),
                                    content_type='application/json',
                                    headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['task']['status'], 'in_progress')
        self.assertEqual(data['task']['priority'], 'high')
        self.assertIn('updated_at', data['task'])
    
    def test_create_workflow(self):
        """Test creating a workflow"""
        workflow_data = {
            'name': 'Auto-close old tasks',
            'trigger': 'task_age > 30 days',
            'actions': ['close_task', 'send_notification']
        }
        response = self.client.post('/api/workflows',
                                   data=json.dumps(workflow_data),
                                   content_type='application/json',
                                   headers=self.headers)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Workflow created')
        self.assertEqual(data['workflow']['name'], 'Auto-close old tasks')
        self.assertTrue(data['workflow']['enabled'])
    
    def test_get_workflows(self):
        """Test getting all workflows"""
        # Create some workflows
        for i in range(2):
            workflow_data = {
                'name': f'Workflow {i}',
                'trigger': f'trigger_{i}',
                'actions': [f'action_{i}']
            }
            self.client.post('/api/workflows',
                           data=json.dumps(workflow_data),
                           content_type='application/json',
                           headers=self.headers)
        
        response = self.client.get('/api/workflows', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['count'], 2)
    
    def test_get_stats(self):
        """Test getting automation statistics"""
        # Create some tasks
        for i in range(5):
            task_data = {
                'title': f'Task {i}',
                'type': 'bug' if i % 2 == 0 else 'feature',
                'priority': 'high'
            }
            self.client.post('/api/tasks',
                           data=json.dumps(task_data),
                           content_type='application/json',
                           headers=self.headers)
        
        response = self.client.get('/api/stats', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['total_tasks'], 5)
        self.assertEqual(data['auto_assigned_tasks'], 5)
        self.assertIn('automation_rate', data)
        self.assertIn('tasks_by_status', data)
        self.assertIn('tasks_by_team', data)
        self.assertIn('estimated_time_saved', data)
    
    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status"""
        # Create tasks with different statuses
        task_data = {
            'title': 'Task 1',
            'type': 'bug',
            'priority': 'high'
        }
        create_response = self.client.post('/api/tasks',
                                          data=json.dumps(task_data),
                                          content_type='application/json',
                                          headers=self.headers)
        task_id = json.loads(create_response.data)['task']['id']
        
        # Update status
        self.client.patch(f'/api/tasks/{task_id}',
                        data=json.dumps({'status': 'completed'}),
                        content_type='application/json',
                        headers=self.headers)
        
        # Filter by status
        response = self.client.get('/api/tasks?status=completed', headers=self.headers)
        data = json.loads(response.data)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['tasks'][0]['status'], 'completed')

if __name__ == '__main__':
    unittest.main()
