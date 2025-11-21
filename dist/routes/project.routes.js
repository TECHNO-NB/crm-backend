"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = (0, express_1.Router)();
// All routes require authentication
// router.use(jwtVerify);
// Public route: fetch all projects
router.get('/', project_controller_1.getAllProjectsController);
router.get('/:id', project_controller_1.getProjectByIdController);
// Restricted routes: Admin and Country Manager
router.post('/', multerMiddleware_1.default.array('documents', 10), (0, authMiddleware_js_1.authorizeRoles)('admin', 'finance', 'chairmain', 'country_chairman'), project_controller_1.createProjectController);
router.put('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin', 'country_manager'), project_controller_1.updateProjectController);
router.delete('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin'), project_controller_1.deleteProjectController);
exports.default = router;
