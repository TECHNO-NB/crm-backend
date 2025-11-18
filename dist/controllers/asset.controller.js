"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssetController = exports.updateAssetController = exports.createAssetController = exports.getAssetByIdController = exports.getAllAssetsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all assets
const getAllAssetsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assets = yield db_1.default.asset.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Assets fetched successfully", assets));
}));
exports.getAllAssetsController = getAllAssetsController;
// Fetch single asset
const getAssetByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const asset = yield db_1.default.asset.findUnique({ where: { id }, include: { owner: true } });
    if (!asset)
        throw new apiError_1.default(false, 404, "Asset not found");
    res.status(200).json(new apiResponse_1.default(true, 200, "Asset fetched successfully", asset));
}));
exports.getAssetByIdController = getAssetByIdController;
// Create asset
const createAssetController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, location, ownerId, purchaseDate, serialNo, status, notes } = req.body;
    if (!name || !type || !status)
        throw new apiError_1.default(false, 400, "Name, type, and status are required");
    const asset = yield db_1.default.asset.create({
        data: { name, type, location, ownerId, purchaseDate: purchaseDate ? new Date(purchaseDate) : null, serialNo, status, notes },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, "Asset created successfully", asset));
}));
exports.createAssetController = createAssetController;
// Update asset
const updateAssetController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingAsset = yield db_1.default.asset.findUnique({ where: { id } });
    if (!existingAsset)
        throw new apiError_1.default(false, 404, "Asset not found");
    const updatedAsset = yield db_1.default.asset.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, "Asset updated successfully", updatedAsset));
}));
exports.updateAssetController = updateAssetController;
// Delete asset
const deleteAssetController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingAsset = yield db_1.default.asset.findUnique({ where: { id } });
    if (!existingAsset)
        throw new apiError_1.default(false, 404, "Asset not found");
    yield db_1.default.asset.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Asset deleted successfully"));
}));
exports.deleteAssetController = deleteAssetController;
