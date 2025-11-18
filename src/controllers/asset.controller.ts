import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Fetch all assets
const getAllAssetsController = asyncHandler(async (req: Request, res: Response) => {
  const assets = await prisma.asset.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" } });
  res.status(200).json(new ApiResponse(true, 200, "Assets fetched successfully", assets));
});

// Fetch single asset
const getAssetByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const asset = await prisma.asset.findUnique({ where: { id }, include: { owner: true } });
  if (!asset) throw new ApiError(false, 404, "Asset not found");
  res.status(200).json(new ApiResponse(true, 200, "Asset fetched successfully", asset));
});

// Create asset
const createAssetController = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, location, ownerId, purchaseDate, serialNo, status, notes } = req.body;
  if (!name || !type || !status) throw new ApiError(false, 400, "Name, type, and status are required");

  const asset = await prisma.asset.create({
    data: { name, type, location, ownerId, purchaseDate: purchaseDate ? new Date(purchaseDate) : null, serialNo, status, notes },
  });

  res.status(201).json(new ApiResponse(true, 201, "Asset created successfully", asset));
});

// Update asset
const updateAssetController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingAsset = await prisma.asset.findUnique({ where: { id } });
  if (!existingAsset) throw new ApiError(false, 404, "Asset not found");

  const updatedAsset = await prisma.asset.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, "Asset updated successfully", updatedAsset));
});

// Delete asset
const deleteAssetController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingAsset = await prisma.asset.findUnique({ where: { id } });
  if (!existingAsset) throw new ApiError(false, 404, "Asset not found");

  await prisma.asset.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, "Asset deleted successfully"));
});

export { getAllAssetsController, getAssetByIdController, createAssetController, updateAssetController, deleteAssetController };
