"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Authenticated routes
router.get("/", authMiddleware_1.jwtVerify, notification_controller_1.getAllNotificationsController); // Fetch all notifications
router.get("/:id", authMiddleware_1.jwtVerify, notification_controller_1.getNotificationByIdController); // Fetch single notification
// Only admin / system users can create or manage notifications
router.post("/", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "hr", "it", "volunteer"), notification_controller_1.createNotificationController);
router.put("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "hr", "it"), notification_controller_1.updateNotificationController);
router.delete("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "hr", "it"), notification_controller_1.deleteNotificationController);
exports.default = router;
