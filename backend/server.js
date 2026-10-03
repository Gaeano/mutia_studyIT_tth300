const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

//get all task
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        task_id AS id,
        task_title AS title, 
        subject,
        DATE_FORMAT(due_date, '%Y-%m-%d') AS dueDate,
        IF(status = 'Completed', TRUE, FALSE) AS isCompleted
      FROM tasks
      ORDER BY (status = 'Completed') ASC, due_date ASC
    `);

    const tasks = rows.map((row) => ({
      ...row,
      id: String(row.id),
      isCompleted: Boolean(row.isCompleted),
    }));

    res.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

//new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;
    const [result] = await db.execute(
      'INSERT INTO tasks (task_title, subject, due_date, status) VALUES (?, ?, ?, "Not Started")',
      [title, subject, dueDate]
    );

    res.status(201).json({
      id: String(result.insertId),
      title,
      subject,
      dueDate,
      isCompleted: false,
    });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

//edit task
app.patch('/api/tasks', async (req, res) => {
  try {
    const { id, title, subject, dueDate, isCompleted, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Task id is required' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('task_title = ?');
      values.push(title);
    }

    if (subject !== undefined) {
      updates.push('subject = ?');
      values.push(subject);
    }

    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(dueDate);
    }

    if (isCompleted !== undefined) {
      updates.push('status = ?');
      values.push(isCompleted ? 'Completed' : 'Not Started');
    } else if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.execute(
      `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = ?`,
      values
    );

    res.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/tasks error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

//delete a task
app.delete('/api/tasks', async (req, res) => {
  try {
    const { id } = req.body;
    await db.execute('DELETE FROM tasks WHERE task_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});