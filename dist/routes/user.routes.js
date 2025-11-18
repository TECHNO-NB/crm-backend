"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_js_1.jwtVerify, user_controller_js_1.getAllUsers);
// get only one user
router.get("/:id", authMiddleware_js_1.jwtVerify, user_controller_js_1.getOneUser);
// Admin and HR can update users
router.put("/:id", authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)("admin", "hr"), user_controller_js_1.updateUser);
// Admin can delete users
router.delete("/:id", authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)("admin"), user_controller_js_1.deleteUser);
// Admin can change roles
router.patch("/:id/role", authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)("admin"), user_controller_js_1.changeUserRole);
exports.default = router;
