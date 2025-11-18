"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
// import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';
const router = (0, express_1.Router)();
router.get('/', user_controller_js_1.getAllUsers);
// get only one user
router.get('/:id', user_controller_js_1.getOneUser);
// Admin and HR can update users
router.put('/:id', user_controller_js_1.updateUser);
// Admin can delete users
router.delete('/:id', user_controller_js_1.deleteUser);
// Admin can change roles
router.patch('/:id/role', user_controller_js_1.changeUserRole);
exports.default = router;
