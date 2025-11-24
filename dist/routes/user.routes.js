"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
router.use(authMiddleware_js_1.jwtVerify);
router.get('/', user_controller_js_1.getAllUsers);
// get only one user
router.get('/:id', user_controller_js_1.getOneUser);
// Admin and HR can update users
router.put('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin', 'country_manager', 'hr'), user_controller_js_1.updateUser);
// Admin can delete users
router.delete('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin', 'country_manager', 'hr'), user_controller_js_1.deleteUser);
// Admin can change roles
router.patch('/:id/role', (0, authMiddleware_js_1.authorizeRoles)('admin', 'country_manager', 'hr'), user_controller_js_1.changeUserRole);
exports.default = router;
