"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = require("../controllers/asset.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public / Authenticated routes
router.get("/", authMiddleware_1.jwtVerify, asset_controller_1.getAllAssetsController);
router.get("/:id", authMiddleware_1.jwtVerify, asset_controller_1.getAssetByIdController);
// Admin / IT routes
router.post("/", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "it"), asset_controller_1.createAssetController);
router.put("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "it"), asset_controller_1.updateAssetController);
router.delete("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "it"), asset_controller_1.deleteAssetController);
exports.default = router;
