import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

router.get('/conversations', ChatController.getConversations);
router.post('/conversations', ChatController.createConversation);
router.get('/conversations/:id', ChatController.getConversationDetails);

router.get('/conversations/:id/messages', ChatController.getMessages);
router.post('/conversations/:id/messages', ChatController.sendMessage);
router.post('/conversations/:id/read', ChatController.markRead);

router.patch('/messages/:id', ChatController.editMessage);
router.delete('/messages/:id', ChatController.deleteMessage);
router.post('/messages/:id/pin', ChatController.togglePin);
router.post('/messages/:id/reactions', ChatController.addReaction);
router.delete('/messages/:id/reactions', ChatController.removeReaction);

export default router;
