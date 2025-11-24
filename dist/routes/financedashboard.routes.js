"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import {  getProjectFinancials } from '../controllers/financedashboard.controller.js';
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const financedashboard_controller_js_1 = require("../controllers/financedashboard.controller.js");
const router = express_1.default.Router();
router.use(authMiddleware_js_1.jwtVerify);
// Only specific roles can access
router.get('/', (0, authMiddleware_js_1.authorizeRoles)('admin'), financedashboard_controller_js_1.getAllCountryFinanceDetails);
exports.default = router;
