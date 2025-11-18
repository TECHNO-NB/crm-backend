import { Router } from "express";
import {
  getAllNotificationsController,
  getNotificationByIdController,
  createNotificationController,
  updateNotificationController,
  deleteNotificationController,
} from "../controllers/notification.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Authenticated routes
router.get("/", jwtVerify, getAllNotificationsController); // Fetch all notifications
router.get("/:id", jwtVerify, getNotificationByIdController); // Fetch single notification

// Only admin / system users can create or manage notifications
router.post("/", jwtVerify, authorizeRoles("admin", "hr", "it","volunteer"), createNotificationController);
router.put("/:id", jwtVerify, authorizeRoles("admin", "hr", "it"), updateNotificationController);
router.delete("/:id", jwtVerify, authorizeRoles("admin", "hr", "it"), deleteNotificationController);

export default router;
