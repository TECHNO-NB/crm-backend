import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Fetch all notifications
const getAllNotificationsController = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(new ApiResponse(true, 200, "Notifications fetched successfully", notifications));
});

// Fetch single notification
const getNotificationByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!notification) throw new ApiError(false, 404, "Notification not found");
  res.status(200).json(new ApiResponse(true, 200, "Notification fetched successfully", notification));
});

// Create notification
const createNotificationController = asyncHandler(async (req: Request, res: Response) => {
  const { userId, channel, title, body, meta } = req.body;

  if (!channel || !title || !body) throw new ApiError(false, 400, "Channel, title, and body are required");

  const notification = await prisma.notification.create({
    data: { userId, channel, title, body, meta },
  });

  res.status(201).json(new ApiResponse(true, 201, "Notification created successfully", notification));
});

// Update notification
const updateNotificationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingNotification = await prisma.notification.findUnique({ where: { id } });
  if (!existingNotification) throw new ApiError(false, 404, "Notification not found");

  const updatedNotification = await prisma.notification.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, "Notification updated successfully", updatedNotification));
});

// Delete notification
const deleteNotificationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingNotification = await prisma.notification.findUnique({ where: { id } });
  if (!existingNotification) throw new ApiError(false, 404, "Notification not found");

  await prisma.notification.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, "Notification deleted successfully"));
});

export {
  getAllNotificationsController,
  getNotificationByIdController,
  createNotificationController,
  updateNotificationController,
  deleteNotificationController,
};
