import { Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';

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
