import { Router } from 'express';
import { getUsers, getUserById, updateUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router;
