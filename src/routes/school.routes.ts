import { Router } from "express";
import {
  getAllSchoolsController,
  getSchoolByIdController,
  createSchoolController,
  updateSchoolController,
  deleteSchoolController,
} from "../controllers/school.controller.js";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// Authenticated routes
router.use(jwtVerify);

// Admin and Country Manager can manage schools
router.get("/", authorizeRoles("admin", "country_manager", "viewer","volunteer"), getAllSchoolsController);
router.get("/:id", authorizeRoles("admin", "country_manager", "viewer"), getSchoolByIdController);

router.post("/", authorizeRoles("admin", "country_manager"), createSchoolController);
router.put("/:id", authorizeRoles("admin", "country_manager"), updateSchoolController);
router.delete("/:id", authorizeRoles("admin", "country_manager"), deleteSchoolController);

export default router;
