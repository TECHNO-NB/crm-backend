import express from "express";
import { getDashboardReportController } from "../controllers/countrymanager.dashboard.controller";
import { jwtVerify,authorizeRoles } from "../middlewares/authMiddleware";


const router = express.Router();

// GET /api/v1/dashboard
router.get("/:country", jwtVerify,authorizeRoles("admin","volunteer","country_manager"),getDashboardReportController);

export default router;
