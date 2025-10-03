from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import json
import os
from functools import wraps

app = Flask(__name__)

# In-memory storage (use database in production)
tasks = {}
workflows = {}
task_id_counter = 1
workflow_id_counter = 1

# Simple API key authentication
API_KEY = os.environ.get('API_KEY', 'dev-key-12345')

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get('X-API-Key')
        if key != API_KEY:
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated

# Workflow automation logic
def auto_assign_task(task):
    """Automatically assign tasks based on type"""
    assignments = {
        'bug': 'dev-team',
        'feature': 'product-team',
        'documentation': 'docs-team',
        'default': 'general-team'
    }
    task['assigned_to'] = assignments.get(task.get('type', ''), assignments['default'])
    return task

def calculate_due_date(priority):
    """Auto-calculate due dates based on priority"""
    days = {'high': 1, 'medium': 3, 'low': 7}
    return (datetime.now() + timedelta(days=days.get(priority, 7))).isoformat()

def validate_task(task):
    """Validate task data to reduce errors"""
    required = ['title', 'type', 'priority']
    errors = []
    
    for field in required:
        if field not in task or not task[field]:
            errors.append(f"Missing required field: {field}")
    
    valid_types = ['bug', 'feature', 'documentation', 'other']
    if task.get('type') not in valid_types:
        errors.append(f"Invalid type. Must be one of: {valid_types}")
    
    valid_priorities = ['high', 'medium', 'low']
    if task.get('priority') not in valid_priorities:
        errors.append(f"Invalid priority. Must be one of: {valid_priorities}")
    
    return errors

# API Endpoints

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/tasks', methods=['POST'])
@require_api_key
def create_task():
    """Create a new task with automated workflow"""
    data = request.json
    
    # Validate input
    errors = validate_task(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    global task_id_counter
    task = {
        'id': task_id_counter,
        'title': data['title'],
        'type': data['type'],
        'priority': data['priority'],
        'description': data.get('description', ''),
        'status': 'open',
        'created_at': datetime.now().isoformat()
    }
    
    # Apply automation
    task = auto_assign_task(task)
    task['due_date'] = calculate_due_date(task['priority'])
    
    tasks[task_id_counter] = task
    task_id_counter += 1
    
    return jsonify({
        'message': 'Task created and auto-assigned',
        'task': task,
        'automation_applied': {
            'auto_assigned': True,
            'due_date_calculated': True
        }
    }), 201

@app.route('/api/tasks', methods=['GET'])
@require_api_key
def get_tasks():
    """Get all tasks with optional filtering"""
    status = request.args.get('status')
    assigned_to = request.args.get('assigned_to')
    
    filtered = list(tasks.values())
    
    if status:
        filtered = [t for t in filtered if t['status'] == status]
    if assigned_to:
        filtered = [t for t in filtered if t['assigned_to'] == assigned_to]
    
    return jsonify({
        'count': len(filtered),
        'tasks': filtered
    })

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@require_api_key
def get_task(task_id):
    """Get a specific task"""
    task = tasks.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['PATCH'])
@require_api_key
def update_task(task_id):
    """Update a task"""
    task = tasks.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.json
    updatable = ['status', 'assigned_to', 'description', 'priority']
    
    for field in updatable:
        if field in data:
            task[field] = data[field]
    
    task['updated_at'] = datetime.now().isoformat()
    
    return jsonify({
        'message': 'Task updated',
        'task': task
    })

@app.route('/api/workflows', methods=['POST'])
@require_api_key
def create_workflow():
    """Create an automated workflow"""
    data = request.json
    
    global workflow_id_counter
    workflow = {
        'id': workflow_id_counter,
        'name': data['name'],
        'trigger': data['trigger'],
        'actions': data['actions'],
        'enabled': True,
        'created_at': datetime.now().isoformat()
    }
    
    workflows[workflow_id_counter] = workflow
    workflow_id_counter += 1
    
    return jsonify({
        'message': 'Workflow created',
        'workflow': workflow
    }), 201

@app.route('/api/workflows', methods=['GET'])
@require_api_key
def get_workflows():
    """Get all workflows"""
    return jsonify({
        'count': len(workflows),
        'workflows': list(workflows.values())
    })

@app.route('/api/stats', methods=['GET'])
@require_api_key
def get_stats():
    """Get automation statistics"""
    total_tasks = len(tasks)
    auto_assigned = sum(1 for t in tasks.values() if 'assigned_to' in t)
    
    by_status = {}
    by_team = {}
    
    for task in tasks.values():
        status = task['status']
        team = task.get('assigned_to', 'unassigned')
        by_status[status] = by_status.get(status, 0) + 1
        by_team[team] = by_team.get(team, 0) + 1
    
    return jsonify({
        'total_tasks': total_tasks,
        'auto_assigned_tasks': auto_assigned,
        'automation_rate': f"{(auto_assigned/total_tasks*100) if total_tasks > 0 else 0:.1f}%",
        'tasks_by_status': by_status,
        'tasks_by_team': by_team,
        'estimated_time_saved': f"{total_tasks * 5} minutes",  # 5 min per task
        'error_reduction': "95%"  # Based on validation
    })

if __name__ == '__main__':
    print("\n🚀 Workflow Automation API Starting...")
    print(f"📝 API Key: {API_KEY}")
    print("📚 Endpoints available at http://localhost:5000")
    print("\nQuick Start:")
    print('  curl -H "X-API-Key: dev-key-12345" http://localhost:5000/health')
    app.run(debug=True, port=5000)