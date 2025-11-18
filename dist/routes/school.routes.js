"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const school_controller_js_1 = require("../controllers/school.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
// Authenticated routes
router.use(authMiddleware_js_1.jwtVerify);
// Admin and Country Manager can manage schools
router.get("/", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager", "viewer", "volunteer"), school_controller_js_1.getAllSchoolsController);
router.get("/:id", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager", "viewer"), school_controller_js_1.getSchoolByIdController);
router.post("/", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager"), school_controller_js_1.createSchoolController);
router.put("/:id", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager"), school_controller_js_1.updateSchoolController);
router.delete("/:id", (0, authMiddleware_js_1.authorizeRoles)("admin", "country_manager"), school_controller_js_1.deleteSchoolController);
exports.default = router;
