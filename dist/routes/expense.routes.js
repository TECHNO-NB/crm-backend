"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_js_1.jwtVerify);
// Public routes (any authenticated user)
router.get("/", expense_controller_1.getAllExpensesController);
router.get("/:id", expense_controller_1.getExpenseByIdController);
// Routes restricted to Admin and Subadmin
router.post("/", (0, authMiddleware_js_1.authorizeRoles)("admin", "subadmin"), expense_controller_1.createExpenseController);
router.put("/:id", (0, authMiddleware_js_1.authorizeRoles)("admin", "subadmin"), expense_controller_1.updateExpenseController);
// Delete restricted to Admin only
router.delete("/:id", (0, authMiddleware_js_1.authorizeRoles)("admin"), expense_controller_1.deleteExpenseController);
exports.default = router;
