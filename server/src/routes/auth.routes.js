import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authGuard, AuthController.logout);
router.get('/me', authGuard, AuthController.getMe);

export default router;
