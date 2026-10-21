import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcementController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authGuard);

router.get('/', AnnouncementController.getAnnouncements);
router.post(
  '/',
  roleGuard('FACULTY', 'DEPT_ADMIN', 'SUPER_ADMIN'),
  AnnouncementController.createAnnouncement
);
router.delete(
  '/:id',
  roleGuard('FACULTY', 'DEPT_ADMIN', 'SUPER_ADMIN'),
  AnnouncementController.deleteAnnouncement
);

export default router;
