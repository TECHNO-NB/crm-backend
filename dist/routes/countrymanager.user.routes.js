"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const countrymanager_user_controller_1 = require("../controllers/countrymanager.user.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// GET /api/v1/countrymanageruser
router.get("/:country", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "volunteer", "country_manager"), countrymanager_user_controller_1.getAllUsersFromManagerCountry);
exports.default = router;
