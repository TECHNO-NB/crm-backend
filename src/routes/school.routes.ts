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
router.get("/",  getAllSchoolsController);
router.get("/:id", getSchoolByIdController);

router.post("/",  createSchoolController);
router.put("/:id",  updateSchoolController);
router.delete("/:id", deleteSchoolController);

export default router;
