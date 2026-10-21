import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

router.post('/chat', AIController.query);
router.post('/summarize', AIController.summarize);
router.get('/deadlines', AIController.getDeadlines);

export default router;
