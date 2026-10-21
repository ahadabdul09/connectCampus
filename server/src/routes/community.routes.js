import { Router } from 'express';
import { CommunityController } from '../controllers/communityController.js';
import { CommunityService } from '../services/communityService.js';
import { authGuard } from '../middleware/authGuard.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.use(authGuard);

router.get('/', async (req, res, next) => {
  try {
    const departments = await CommunityService.getDepartments();
    const clubs = await CommunityService.getClubs(req.user?.id);
    sendSuccess(res, { departments, clubs });
  } catch (error) {
    next(error);
  }
});

router.get('/departments', CommunityController.getDepartments);
router.get('/clubs', CommunityController.getClubs);
router.get('/clubs/:id', CommunityController.getClubDetails);
router.post('/clubs/:id/join', CommunityController.joinClub);
router.post('/clubs/:id/leave', CommunityController.leaveClub);

export default router;
