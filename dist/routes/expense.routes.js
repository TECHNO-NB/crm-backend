"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_js_1.jwtVerify);
// Public routes (any authenticated user)
router.get('/', expense_controller_1.getAllExpensesController);
router.get('/:id', expense_controller_1.getExpenseByIdController);
// Routes restricted to Admin and Subadmin
router.post('/', multerMiddleware_1.default.array('invoiceUrl', 5), expense_controller_1.createExpenseController);
router.patch('/update/:id', (0, authMiddleware_js_1.authorizeRoles)("admin"), expense_controller_1.updateStatusExpenseController);
router.put('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin', 'finance', "country_manager"), expense_controller_1.updateExpenseController);
// Delete restricted to Admin only
router.delete('/:id', (0, authMiddleware_js_1.authorizeRoles)('admin'), expense_controller_1.deleteExpenseController);
exports.default = router;
