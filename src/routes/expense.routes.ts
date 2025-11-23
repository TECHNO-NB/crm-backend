import { Router } from "express";
import {
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
  updateStatusExpenseController,
} from "../controllers/expense.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// All routes require authentication
// router.use(jwtVerify);

// Public routes (any authenticated user)
router.get("/", getAllExpensesController);
router.get("/:id", getExpenseByIdController);

// Routes restricted to Admin and Subadmin
router.post("/",upload.array("invoiceUrl",5), createExpenseController);
router.patch("/update/:id", updateStatusExpenseController);
router.put("/:id", authorizeRoles("admin", "subadmin"), updateExpenseController);

// Delete restricted to Admin only
router.delete("/:id", authorizeRoles("admin"), deleteExpenseController);

export default router;
