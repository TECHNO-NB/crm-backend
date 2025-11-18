"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financedashboard_controller_js_1 = require("../controllers/financedashboard.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = express_1.default.Router();
// Only specific roles can access
router.get('/', authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)('admin', 'chairman', 'financial_manager', "volunteer"), financedashboard_controller_js_1.getProjectFinancials);
exports.default = router;
