"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
// Authenticated routes
router.get("/", notification_controller_1.getAllNotificationsController); // Fetch all notifications
router.get("/:id", notification_controller_1.getNotificationByIdController); // Fetch single notification
// Only admin / system users can create or manage notifications
router.post("/", notification_controller_1.createNotificationController);
router.put("/:id", notification_controller_1.updateNotificationController);
router.delete("/:id", notification_controller_1.deleteNotificationController);
exports.default = router;
