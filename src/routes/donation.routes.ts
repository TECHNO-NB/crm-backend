import { Router } from "express";
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from  "../controllers/donation.controller.js"
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// Any authenticated user can view donations
router.get("/", jwtVerify, getAllDonations);
router.get("/:id", jwtVerify, getDonationById);

// Only admin or finance role can create/update/delete
router.post("/", jwtVerify, authorizeRoles("admin", "finance"), createDonation);
router.put("/:id", jwtVerify, authorizeRoles("admin", "finance"), updateDonation);
router.delete("/:id", jwtVerify, authorizeRoles("admin", "finance"), deleteDonation);

export default router;
