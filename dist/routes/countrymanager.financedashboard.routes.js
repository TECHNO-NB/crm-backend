"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import {  getProjectFinancials } from '../controllers/financedashboard.controller.js';
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const countrymanager_financedashboard_controller_js_1 = require("../controllers/countrymanager.financedashboard.controller.js");
const router = express_1.default.Router();
// Only specific roles can access
router.get('/:countryId', authMiddleware_js_1.jwtVerify, countrymanager_financedashboard_controller_js_1.getOneCountryFinanceDetails);
exports.default = router;
