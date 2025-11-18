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
router.get("/",  getAllNotificationsController); // Fetch all notifications
router.get("/:id",  getNotificationByIdController); // Fetch single notification

// Only admin / system users can create or manage notifications
router.post("/", createNotificationController);
router.put("/:id", updateNotificationController);
router.delete("/:id", deleteNotificationController);

export default router;
