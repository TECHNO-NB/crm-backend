"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
// Authenticated routes only
router.use(authMiddleware_js_1.jwtVerify);
// Dashboard summary report
router.get("/dashboard", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager", "finance"), report_controller_1.getDashboardReportController);
// Single project report
router.get("/project/:projectId", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager", "finance"), report_controller_1.getProjectReportController);
exports.default = router;
