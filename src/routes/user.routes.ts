import { Router } from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  getOneUser,
} from "../controllers/user.controller.js";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();


router.get("/", jwtVerify, getAllUsers);

// get only one user
router.get("/:id", jwtVerify, getOneUser);

// Admin and HR can update users
router.put("/:id", jwtVerify, authorizeRoles("admin", "hr"), updateUser);

// Admin can delete users
router.delete("/:id", jwtVerify, authorizeRoles("admin"), deleteUser);

// Admin can change roles
router.patch("/:id/role", jwtVerify, authorizeRoles("admin"), changeUserRole);

export default router;
