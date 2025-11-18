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
router.get('/count', jwtVerify, getAllUnreadMessageCountController);
router.get('/private-message-count', jwtVerify, getOnlyPrivateUnreadMessageCountController);
router.get('/', jwtVerify, getAllMessagesController); // Fetch all messages
router.get('/:id', jwtVerify, getMessageByIdController); // Fetch single message

// Sending messages (all authenticated users can send)
router.post('/', jwtVerify, createMessageController);

// Only sender, receiver, or admin can update/delete
router.put('/:id', jwtVerify, authorizeRoles('admin'), updateMessageController);
router.delete('/:id', jwtVerify, authorizeRoles('admin'), deleteMessageController);

export default router;
