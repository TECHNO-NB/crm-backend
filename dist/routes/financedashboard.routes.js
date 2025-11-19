"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financedashboard_controller_js_1 = require("../controllers/financedashboard.controller.js");
const router = express_1.default.Router();
// Only specific roles can access
router.get('/', financedashboard_controller_js_1.getAllCountryFinanceDetails);
exports.default = router;
