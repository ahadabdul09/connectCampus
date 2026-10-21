import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authGuard);

router.get('/', EventController.getEvents);
router.post(
  '/',
  roleGuard('FACULTY', 'CLUB_COORDINATOR', 'DEPT_ADMIN', 'SUPER_ADMIN'),
  EventController.createEvent
);
router.post('/:id/register', EventController.registerForEvent);
router.post('/:id/cancel', EventController.cancelRegistration);

export default router;
