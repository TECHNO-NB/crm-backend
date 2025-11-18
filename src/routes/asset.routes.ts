import { Router } from "express";
import {
  getAllAssetsController,
  getAssetByIdController,
  createAssetController,
  updateAssetController,
  deleteAssetController,
} from "../controllers/asset.controller";
import { jwtVerify, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Public / Authenticated routes
router.get("/", jwtVerify, getAllAssetsController);
router.get("/:id", jwtVerify, getAssetByIdController);

// Admin / IT routes
router.post("/", jwtVerify, authorizeRoles("admin", "it"), createAssetController);
router.put("/:id", jwtVerify, authorizeRoles("admin", "it"), updateAssetController);
router.delete("/:id", jwtVerify, authorizeRoles("admin", "it"), deleteAssetController);

export default router;
