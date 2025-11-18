import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import prisma from '../DB/db';

// ✅ Create Country
export const createCountryController = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { countryName, code } = req.body;

  if (!countryName || !code) {
    throw new ApiError(false, 400, 'Country name and code are required');
  }

  const existing = await prisma.country.findFirst({
    where: {
      OR: [{ countryName }, { code }],
    },
  });

  if (existing) {
    throw new ApiError(false, 409, 'Country already exists with same name or code');
  }

  const country = await prisma.country.create({
    data: {
      countryName,
      code,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Country created successfully', country));
});

// ✅ Get All Countries
export const getAllCountriesController = asyncHandler(async (req: Request, res: Response):Promise<any> => {
    console.log("HIT SERVER")
  const countries = await prisma.country.findMany({
    include: {
      provinces: true, 
      schools: true,
      projects: true,
      users: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'All countries fetched successfully', countries));
});

// ✅ Get Single Country by ID
export const getCountryByIdController = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(false, 400, 'Country ID is required');
  }

  const country = await prisma.country.findUnique({
    where: { id },
    include: {
      provinces: true,
      schools: true,
      projects: true,
      users: true,
    },
  });

  if (!country) {
    throw new ApiError(false, 404, 'Country not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Country fetched successfully', country));
});

// ✅ Update Country
export const updateCountryController = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;
  const { countryName, code } = req.body;

  if (!id) {
    throw new ApiError(false, 400, 'Country ID is required');
  }

  const existing = await prisma.country.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(false, 404, 'Country not found');
  }

  const updatedCountry = await prisma.country.update({
    where: { id },
    data: {
      countryName: countryName ?? existing.countryName,
      code: code ?? existing.code,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Country updated successfully', updatedCountry));
});

// ✅ Delete Country
export const deleteCountryController = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(false, 400, 'Country ID is required');
  }

  const existing = await prisma.country.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(false, 404, 'Country not found');
  }

  await prisma.country.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Country deleted successfully'));
});
