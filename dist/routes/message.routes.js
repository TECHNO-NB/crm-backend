"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Authenticated routes
router.get('/count', authMiddleware_1.jwtVerify, message_controller_1.getAllUnreadMessageCountController);
router.get('/private-message-count', authMiddleware_1.jwtVerify, message_controller_1.getOnlyPrivateUnreadMessageCountController);
router.get('/', authMiddleware_1.jwtVerify, message_controller_1.getAllMessagesController); // Fetch all messages
router.get('/:id', authMiddleware_1.jwtVerify, message_controller_1.getMessageByIdController); // Fetch single message
// Sending messages (all authenticated users can send)
router.post('/', authMiddleware_1.jwtVerify, message_controller_1.createMessageController);
// Only sender, receiver, or admin can update/delete
router.put('/:id', authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)('admin'), message_controller_1.updateMessageController);
router.delete('/:id', authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)('admin'), message_controller_1.deleteMessageController);
exports.default = router;
