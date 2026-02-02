import { Response } from 'express';
import { db } from '../db/index';
import { users, tasks, taskAssignees } from '../db/schema';
import { eq, count } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/password';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { fullName, avatarUrl, role } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can update (only self or admin)
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [updatedUser] = await db.update(users)
      .set({
        fullName,
        avatarUrl,
        role: req.user.role === 'admin' ? role : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        avatarUrl: users.avatarUrl,
      });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user (admin only)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await hashPassword(password || 'default123');

    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
      fullName,
      role: role || 'member',
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Cannot delete self
    if (req.user.userId === userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning();

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    // Total users
    const [totalUsers] = await db.select({ count: count() }).from(users);

    // Users by role
    const roleStats = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    res.json({
      total: totalUsers?.count || 0,
      byRole: roleStats.reduce((acc, item) => {
        acc[item.role] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
