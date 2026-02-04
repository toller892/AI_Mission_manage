import { Router } from 'express';
import { getUsers, getUserById, updateUser, createUser, deleteUser, getUserStats, resetPassword } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/password', resetPassword);
router.delete('/:id', deleteUser);

export default router;
