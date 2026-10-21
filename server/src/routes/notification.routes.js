import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

router.get('/', NotificationController.getNotifications);
router.post('/read-all', NotificationController.markAllRead);
router.post('/:id/read', NotificationController.markRead);

export default router;
