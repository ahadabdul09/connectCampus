import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

router.get('/', SearchController.search);

export default router;
