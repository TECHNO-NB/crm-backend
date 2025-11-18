import express from "express";
import { getDashboardReportController } from "../controllers/dashboard.controller";
import { jwtVerify,authorizeRoles } from "../middlewares/authMiddleware";


const router = express.Router();

// GET /api/v1/dashboard
router.get("/", jwtVerify,authorizeRoles("admin","volunteer"),getDashboardReportController);

export default router;
