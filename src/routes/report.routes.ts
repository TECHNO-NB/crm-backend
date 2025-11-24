import { Router } from "express";
import { getDashboardReportController, getProjectReportController } from "../controllers/report.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// Authenticated routes only
router.use(jwtVerify);

// Dashboard summary report
router.get("/dashboard", authorizeRoles("admin", "country_manager", "finance"), getDashboardReportController);

// Single project report
router.get("/project/:projectId", authorizeRoles("admin", "country_manager", "finance"), getProjectReportController);

export default router;
