import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = Router();

router.use(authGuard);

router.post('/chat', AIController.query);
router.post('/summarize', AIController.summarize);
router.get('/deadlines', AIController.getDeadlines);
router.post('/documents', roleGuard('SUPER_ADMIN', 'DEPT_ADMIN'), AIController.uploadDocument);

export default router;
