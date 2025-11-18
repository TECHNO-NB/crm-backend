import { Router } from 'express';
import {
  getAllMessagesController,
  getMessageByIdController,
  createMessageController,
  updateMessageController,
  deleteMessageController,
  getAllUnreadMessageCountController,
  getOnlyPrivateUnreadMessageCountController,
} from '../controllers/message.controller';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Authenticated routes
router.get('/count', getAllUnreadMessageCountController);
router.get('/private-message-count', getOnlyPrivateUnreadMessageCountController);
router.get('/',  getAllMessagesController); // Fetch all messages
router.get('/:id',  getMessageByIdController); // Fetch single message

// Sending messages (all authenticated users can send)
router.post('/',  createMessageController);

// Only sender, receiver, or admin can update/delete
router.put('/:id',  updateMessageController);
router.delete('/:id',  deleteMessageController);

export default router;
