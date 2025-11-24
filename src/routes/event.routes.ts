import { Router } from "express";
import {
  getAllEventsController,
  getEventByIdController,
  createEventController,
  updateEventController,
  deleteEventController,
} from "../controllers/event.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Public / Authenticated routes
router.get("/", getAllEventsController);
router.get("/:id", jwtVerify, getEventByIdController);

// Admin / Manager routes
router.post("/", jwtVerify, authorizeRoles("admin", "country_manager","hr"), createEventController);
router.put("/:id", jwtVerify, authorizeRoles("admin", "country_manager","hr"), updateEventController);
router.delete("/:id", jwtVerify, authorizeRoles("admin", "country_manager","hr"), deleteEventController);

export default router;
