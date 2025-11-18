"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const countrymanager_dashboard_controller_1 = require("../controllers/countrymanager.dashboard.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// GET /api/v1/dashboard
router.get("/:country", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "volunteer", "country_manager"), countrymanager_dashboard_controller_1.getDashboardReportController);
exports.default = router;
