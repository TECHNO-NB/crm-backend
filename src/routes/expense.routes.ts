import { Router } from "express";
import {
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
} from "../controllers/expense.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(jwtVerify);

// Public routes (any authenticated user)
router.get("/", getAllExpensesController);
router.get("/:id", getExpenseByIdController);

// Routes restricted to Admin and Subadmin
router.post("/", authorizeRoles("admin", "subadmin"), createExpenseController);
router.put("/:id", authorizeRoles("admin", "subadmin"), updateExpenseController);

// Delete restricted to Admin only
router.delete("/:id", authorizeRoles("admin"), deleteExpenseController);

export default router;
