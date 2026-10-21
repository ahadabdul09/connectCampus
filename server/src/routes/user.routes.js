import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);
router.get('/', UserController.listCampusUsers);
router.get('/:id', UserController.getUserById);

export default router;
