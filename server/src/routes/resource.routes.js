import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';
import { authGuard } from '../middleware/authGuard.js';
import { uploadMiddleware } from '../config/upload.js';

const router = Router();

router.use(authGuard);

router.get('/', ResourceController.getResources);
router.post('/', uploadMiddleware.single('file'), ResourceController.uploadResource);
router.post('/:id/download', ResourceController.recordDownload);

export default router;
