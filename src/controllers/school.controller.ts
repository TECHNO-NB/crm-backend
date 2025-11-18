import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Fetch all schools
const getAllSchoolsController = asyncHandler(async (req: Request, res: Response) => {
  const schools = await prisma.school.findMany({
    include: { province: true, country: true },
  });
  res.status(200).json(new ApiResponse(true, 200, "Schools fetched successfully", schools));
});

// Fetch single school
const getSchoolByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const school = await prisma.school.findUnique({
    where: { id },
    include: { province: true, country: true },
  });

  if (!school) throw new ApiError(false, 404, "School not found");

  res.status(200).json(new ApiResponse(true, 200, "School fetched successfully", school));
});

// Create school
const createSchoolController = asyncHandler(async (req: Request, res: Response) => {
  const { name, provinceId, address, studentCount, countryId, contactName, contactPhone, contactEmail, photos } =
    req.body;

  if (!name || !countryId) throw new ApiError(false, 400, "Name and Country are required");

  const newSchool = await prisma.school.create({
    data: {
      name,
      provinceId,
      address,
      studentCount,
      countryId,
      contactName,
      contactPhone,
      contactEmail,
      photos,
    },
  });

  res.status(201).json(new ApiResponse(true, 201, "School created successfully", newSchool));
});

// Update school
const updateSchoolController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingSchool = await prisma.school.findUnique({ where: { id } });
  if (!existingSchool) throw new ApiError(false, 404, "School not found");

  const updatedSchool = await prisma.school.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, "School updated successfully", updatedSchool));
});

// Delete school
const deleteSchoolController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingSchool = await prisma.school.findUnique({ where: { id } });
  if (!existingSchool) throw new ApiError(false, 404, "School not found");

  await prisma.school.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, "School deleted successfully"));
});

export {
  getAllSchoolsController,
  getSchoolByIdController,
  createSchoolController,
  updateSchoolController,
  deleteSchoolController,
};
