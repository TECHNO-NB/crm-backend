import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../DB/db";

// General JWT verification middleware
const jwtVerify = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken || !refreshToken) {
    throw new ApiError(false, 401, "Access token and refresh token are required");
  }

  const decodedAccess = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET!) as JwtPayload;
  if (!decodedAccess?.id) throw new ApiError(false, 401, "Invalid access token");

  const user = await prisma.user.findUnique({ where: { id: decodedAccess.id } });
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(false, 401, "Invalid refresh token");
  }

  const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!);
  if (!decodedRefresh) throw new ApiError(false, 401, "Invalid refresh token");

  // @ts-ignore
  req.user = user;
  next();
});

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;

    if (!user) throw new ApiError(false, 401, "User not authenticated");

    if (!allowedRoles.includes(user.role)) {
      throw new ApiError(false, 403, `Forbidden: Only ${allowedRoles.join(", ")} can access`);
    }

    next();
  });

export { jwtVerify, authorizeRoles };
