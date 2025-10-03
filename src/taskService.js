const { v4: uuidv4 } = require('uuid');

class TaskService {
  constructor(db) {
    this.db = db;
  }

  validateTask(task) {
    const errors = [];
    
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (task.title && task.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (task.status && !validStatuses.includes(task.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (task.priority && !validPriorities.includes(task.priority)) {
      errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
    }
    
    return errors;
  }

  createTask(taskData) {
    const errors = this.validateTask(taskData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const id = uuidv4();
    const task = {
      id,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assigned_to: taskData.assigned_to || null,
      due_date: taskData.due_date || null,
      tags: JSON.stringify(taskData.tags || [])
    };

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, assigned_to, due_date, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.assigned_to,
      task.due_date,
      task.tags
    );

    // Log to audit
    this.logAudit('task', task.id, 'create', JSON.stringify(task));

    return this.getTask(id);
  }

  getTask(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id);
    
    if (task && task.tags) {
      task.tags = JSON.parse(task.tags);
    }
    
    return task;
  }

  getAllTasks(filters = {}) {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const stmt = this.db.prepare(query);
    const tasks = stmt.all(...params);

    return tasks.map(task => {
      if (task.tags) {
        task.tags = JSON.parse(task.tags);
      }
      return task;
    });
  }

  updateTask(id, updates) {
    const existingTask = this.getTask(id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const mergedTask = { ...existingTask, ...updates };
    const errors = this.validateTask(mergedTask);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.assigned_to !== undefined) {
      fields.push('assigned_to = ?');
      values.push(updates.assigned_to);
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    // Log to audit
    this.logAudit('task', id, 'update', JSON.stringify(updates));

    return this.getTask(id);
  }

  deleteTask(id) {
    const task = this.getTask(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);

    // Log to audit
    this.logAudit('task', id, 'delete', JSON.stringify(task));

    return { success: true, message: 'Task deleted successfully' };
  }

  getTaskStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks');
    const total = totalStmt.get().count;

    const byStatusStmt = this.db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status
    `);
    const byStatus = byStatusStmt.all();

    const byPriorityStmt = this.db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority
    `);
    const byPriority = byPriorityStmt.all();

    return {
      total,
      byStatus: byStatus.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, row) => {
        acc[row.priority] = row.count;
        return acc;
      }, {})
    };
  }

  logAudit(entityType, entityId, action, details) {
    const stmt = this.db.prepare(`
      INSERT INTO audit_log (id, entity_type, entity_id, action, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(uuidv4(), entityType, entityId, action, details);
  }
}

module.exports = TaskService;
