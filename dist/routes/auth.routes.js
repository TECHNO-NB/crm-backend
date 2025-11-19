"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = express_1.default.Router();
router.post('/register', multerMiddleware_1.default.single('avatar'), auth_controller_1.registerUserControllers);
router.post('/login', auth_controller_1.loginUserControllers);
router.get('/verify', authMiddleware_1.jwtVerify, auth_controller_1.verifyUserControllers);
router.post('/logout', authMiddleware_1.jwtVerify, auth_controller_1.logoutUserControllers);
exports.default = router;
