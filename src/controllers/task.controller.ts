import { Response } from 'express';
import { db } from '../db/index';
import { tasks, taskAssignees, taskComments, taskHistory, users } from '../db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, creatorId, assigneeId } = req.query;

    let query = db.select({
      task: tasks,
      creator: users,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.creatorId, users.id))
    .orderBy(desc(tasks.createdAt));

    const result = await query;

    // Get assignees for each task
    const tasksWithAssignees = await Promise.all(
      result.map(async (item) => {
        const assigneesList = await db
          .select({ user: users })
          .from(taskAssignees)
          .leftJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, item.task.id));

        return {
          ...item.task,
          creator: item.creator ? {
            id: item.creator.id,
            username: item.creator.username,
            fullName: item.creator.fullName,
          } : null,
          assignees: assigneesList.map(a => a.user ? {
            id: a.user.id,
            username: a.user.username,
            fullName: a.user.fullName,
          } : null).filter(Boolean),
        };
      })
    );

    res.json(tasksWithAssignees);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get creator
    let creator = null;
    if (task.creatorId) {
      const [creatorUser] = await db.select().from(users).where(eq(users.id, task.creatorId)).limit(1);
      if (creatorUser) {
        creator = {
          id: creatorUser.id,
          username: creatorUser.username,
          fullName: creatorUser.fullName,
        };
      }
    }

    // Get assignees
    const assigneesList = await db
      .select({ user: users })
      .from(taskAssignees)
      .leftJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    // Get comments
    const commentsList = await db
      .select({
        comment: taskComments,
        user: users,
      })
      .from(taskComments)
      .leftJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));

    res.json({
      ...task,
      creator,
      assignees: assigneesList.map(a => a.user ? {
        id: a.user.id,
        username: a.user.username,
        fullName: a.user.fullName,
      } : null).filter(Boolean),
      comments: commentsList.map(c => ({
        id: c.comment.id,
        content: c.comment.content,
        createdAt: c.comment.createdAt,
        user: c.user ? {
          id: c.user.id,
          username: c.user.username,
          fullName: c.user.fullName,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, assigneeIds, paId, ticketUrl, tags, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create task
    const [newTask] = await db.insert(tasks).values({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      creatorId: req.user.userId,
      paId,
      dueDate,
      ticketUrl,
      tags,
      notes,
    }).returning();

    // Assign users
    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await db.insert(taskAssignees).values(
        assigneeIds.map((userId: number) => ({
          taskId: newTask.id,
          userId,
        }))
      );
    }

    // Log history
    await db.insert(taskHistory).values({
      taskId: newTask.id,
      userId: req.user.userId,
      action: 'created',
      details: JSON.stringify({ title }),
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority, dueDate, completedDate, assigneeIds, paId, ticketUrl, tags, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task
    const [updatedTask] = await db.update(tasks)
      .set({
        title,
        description,
        status,
        priority,
        dueDate,
        completedDate,
        paId,
        ticketUrl,
        tags,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // Update assignees
    if (assigneeIds !== undefined) {
      await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
      
      if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
        await db.insert(taskAssignees).values(
          assigneeIds.map((userId: number) => ({
            taskId,
            userId,
          }))
        );
      }
    }

    // Log history
    await db.insert(taskHistory).values({
      taskId,
      userId: req.user.userId,
      action: 'updated',
      details: JSON.stringify({ changes: req.body }),
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete task (cascades to assignees, comments, history)
    await db.delete(tasks).where(eq(tasks.id, taskId));

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add comment
    const [newComment] = await db.insert(taskComments).values({
      taskId,
      userId: req.user.userId,
      content,
    }).returning();

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
