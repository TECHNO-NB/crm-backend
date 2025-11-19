// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../DB/db';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { hashPassword, comparePassword } from '../utils/hash';
import { uploadToCloudinary } from '../utils/cloudinary';

// Fetch all users
const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const users = await prisma.$queryRaw`
  SELECT 
    u.id, u."fullName", u.email, u.phone, u.role,
    u."countryId", c."countryName" AS "countryName",
    u."provinceId", u."avatarUrl", u.address,
    u."isActive", u."createdAt", u."updatedAt",
    lm."latestMessageDate"
  FROM "User" u
  LEFT JOIN "Country" c
    ON c.id = u."countryId"
  LEFT JOIN (
    SELECT "toUserId", MAX("createdAt") AS "latestMessageDate"
    FROM "Message"
    GROUP BY "toUserId"
  ) lm
    ON lm."toUserId" = u.id
 ORDER BY lm."latestMessageDate" ASC NULLS LAST;

`;

  return res.status(200).json(new ApiResponse(true, 200, 'Fetched all users successfully', users));
});

// Update user info
const updateUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { fullName, phone, address, countryId, provinceId } = req.body;
  const avatar = req.file?.path;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(false, 404, 'User not found');

  let avatarUrl = user.avatarUrl;
  if (avatar) {
    const uploadedUrl = await uploadToCloudinary(avatar);
    if (!uploadedUrl) throw new ApiError(false, 500, 'Avatar upload failed');
    avatarUrl = uploadedUrl;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      fullName: fullName ?? user.fullName,
      phone: phone ?? user.phone,
      address: address ?? user.address,
      countryId: countryId ?? user.countryId,
      provinceId: provinceId ?? user.provinceId,
      avatarUrl,
    },
  });

  return res.status(200).json(new ApiResponse(true, 200, 'User updated successfully', updatedUser));
});

// Delete user
const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(false, 404, 'User not found');

  await prisma.user.delete({ where: { id } });

  return res.status(200).json(new ApiResponse(true, 200, 'User deleted successfully', null));
});

// Change user role
const changeUserRole = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  const validRoles = [
    'chairman',
    'country_manager',
    'finance',
    'legal',
    'hr',
    'admin',
    'it',
    'councilor',
    'volunteer',
    'viewer',
  ];
  if (!role || !validRoles.includes(role)) {
    throw new ApiError(false, 400, 'Invalid role provided');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(false, 404, 'User not found');

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'User role updated successfully', updatedUser));
});

// get only one user by id
const getOneUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(false, 401, 'user must login');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      fullName: true,
      email: true,
      id: true,
      avatarUrl: true,
      country: true,
      role: true,
    },
  });

  return res.status(200).json(new ApiResponse(true, 200, 'User get successfully', user));
});

export { getAllUsers, updateUser, deleteUser, changeUserRole, getOneUser };
