import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authGuard);
router.use(roleGuard('SUPER_ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.patch('/reports/:id', AdminController.resolveReport);

export default router;
