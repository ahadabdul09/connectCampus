import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import chatRoutes from './chat.routes.js';
import communityRoutes from './community.routes.js';
import announcementRoutes from './announcement.routes.js';
import eventRoutes from './event.routes.js';
import resourceRoutes from './resource.routes.js';
import notificationRoutes from './notification.routes.js';
import searchRoutes from './search.routes.js';
import aiRoutes from './ai.routes.js';
import adminRoutes from './admin.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/communities', communityRoutes);
apiRouter.use('/announcements', announcementRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
