import { Router } from "express";
import {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(jwtVerify);

// Public route: fetch all projects
router.get("/", getAllProjectsController);
router.get("/:id", getProjectByIdController);

// Restricted routes: Admin and Country Manager
router.post("/", authorizeRoles("admin", "country_manager"), createProjectController);
router.put("/:id", authorizeRoles("admin", "country_manager"), updateProjectController);
router.delete("/:id", authorizeRoles("admin"), deleteProjectController);

export default router;
