import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import ApiResponse from '../utils/apiResponse';
import generateRefreshAcessToken from '../helpers/generateJwtTokens';
import { cookieOptions } from '../helpers/cookieOption';
import { uploadToCloudinary } from '../utils/cloudinary';
import { comparePassword, hashPassword } from '../utils/hash';

// user register
const registerUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { email, fullName, password, phone, countryId, address } = req.body;
  const avatar = req.file?.path;
  if (!avatar) {
    throw new ApiError(false, 400, 'Avatar is required');
  }

  if (!email || !fullName || !password || !address || !phone || !countryId) {
    throw new ApiError(false, 400, 'Please fill the all required field');
  }
  const alreadyRegisterUser = await prisma.user.findUnique({ where: { email: email } });
  if (alreadyRegisterUser) {
    throw new ApiError(false, 409, 'User already register with this email');
  }
  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    throw new ApiError(false, 500, 'Password hash failed');
  }

  const cloudinaryUrl = await uploadToCloudinary(avatar);
  if (!cloudinaryUrl) {
    throw new ApiError(false, 500, 'Avatar upload failed');
  }

  const userData = {
    phone: phone,
    email: email,
    fullName: fullName,
    avatarUrl: cloudinaryUrl,
    countryId: countryId,
    password: hashedPassword,
    address: address,
  };
  const createUser = await prisma.user.create({
    data: userData,
  });
  if (!createUser) {
    throw new ApiError(false, 500, 'User register failed');
  }
  return res.status(201).json(new ApiResponse(true, 201, 'User register successfully', createUser));
});

// login user
const loginUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(false, 400, 'Please fill the all required field');
  }
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user || !user.password) {
    throw new ApiError(false, 404, 'User not found');
  }
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(false, 400, 'Invalid password');
  }
  const dataOfUser = {
    id: user?.id,
    email: user?.email,
    fullName: user?.fullName,
  };
  const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
  if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
    throw new ApiError(false, 500, 'Jwt Token Generate failed');
  }
  return res
    .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
    .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(true, 200, 'User login successfully', user));
});

// verify user
const verifyUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  // @ts-ignore
  const user = req.user;
  if (!user.id) {
    throw new ApiError(false, 401, 'Id is required');
  }

  const dataOfUser = {
    id: user?.id,
    email: user?.email,
    fullName: user?.fullName,
    role: user?.role,
  };

  const getUser = await prisma.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      avatarUrl: true,
      country: true,
      fullName:true,
      role: true,
    },
  });

  const generateJwtToken = await generateRefreshAcessToken(dataOfUser);
  if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
    throw new ApiError(false, 500, 'Jwt Token Generate failed');
  }
  return res
    .cookie('accessToken', generateJwtToken.accessToken, cookieOptions)
    .cookie('refreshToken', generateJwtToken.refreshToken, cookieOptions)
    .status(201)
    .json(new ApiResponse(true, 201, 'User verify successfully', getUser));
});

// logout user
const logoutUserControllers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(true, 200, 'User logout successfully'));
});

export {
  registerUserControllers,
  loginUserControllers,
  verifyUserControllers,
  logoutUserControllers,
};
