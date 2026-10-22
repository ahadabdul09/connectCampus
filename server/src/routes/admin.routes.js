import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authGuard);
router.use(roleGuard('SUPER_ADMIN'));

// Platform Analytics & System Metrics
router.get('/stats', AdminController.getStats);

// User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id', AdminController.updateUser);

// User Invitations (Method B)
router.get('/invitations', AdminController.getInvitations);
router.post('/invitations', AdminController.inviteUser);
router.post('/users/invite', AdminController.inviteUser);
router.delete('/invitations/:id', AdminController.revokeInvitation);

// Department Management
router.post('/departments', AdminController.createDepartment);
router.delete('/departments/:id', AdminController.deleteDepartment);

// Club Management
router.post('/clubs', AdminController.createClub);
router.delete('/clubs/:id', AdminController.deleteClub);

// Content Moderation Reports
router.patch('/reports/:id', AdminController.resolveReport);

export default router;
