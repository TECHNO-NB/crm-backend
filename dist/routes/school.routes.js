"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const school_controller_js_1 = require("../controllers/school.controller.js");
const router = (0, express_1.Router)();
// Authenticated routes
// router.use(jwtVerify);
// Admin and Country Manager can manage schools
router.get("/", school_controller_js_1.getAllSchoolsController);
router.get("/:id", school_controller_js_1.getSchoolByIdController);
router.post("/", school_controller_js_1.createSchoolController);
router.put("/:id", school_controller_js_1.updateSchoolController);
router.delete("/:id", school_controller_js_1.deleteSchoolController);
exports.default = router;
