"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const legal_controller_js_1 = require("../controllers/legal.controller.js"); // Adjust path
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const multerMiddleware_js_1 = __importDefault(require("../middlewares/multerMiddleware.js"));
const router = (0, express_1.Router)();
// Routes protected by general authentication
router.use(authMiddleware_js_1.jwtVerify);
// --- PUBLIC FETCH ---
// Fetch all cases (with filtering)
router.get('/', legal_controller_js_1.fetchLegalCasesController);
router.get('/:caseId', legal_controller_js_1.getLegalCaseByIdController);
// Routes protected by authorization (Admin/Legal team only)
router.use(authMiddleware_js_1.jwtVerify);
// --- ADD CASE ---
// Use Multer middleware 'upload.array' for multiple file uploads
router.post('/', multerMiddleware_js_1.default.array('documents', 5), // 'documents' is the field name, max 5 files
legal_controller_js_1.addLegalCaseController);
// --- EDIT / DELETE / STATUS CHANGE ---
router.route('/:caseId')
    .put(legal_controller_js_1.editLegalCaseController) // Edit case details
    .delete(legal_controller_js_1.deleteLegalCaseController); // Delete case
// Specific route for status change
router.patch('/:caseId/status', legal_controller_js_1.changeLegalCaseStatusController);
exports.default = router;
