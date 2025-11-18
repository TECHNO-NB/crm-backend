import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import ApiResponse from '../utils/apiResponse';

// Fetch all messages
const getAllMessagesController = asyncHandler(async (req: Request, res: Response) => {
  const messages = await prisma.message.findMany({
    include: { fromUser: true, toUser: true },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json(new ApiResponse(true, 200, 'Messages fetched successfully', messages));
});

// Fetch single message
const getMessageByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const message = await prisma.message.findUnique({
    where: { id },
    include: { fromUser: true, toUser: true },
  });
  if (!message) throw new ApiError(false, 404, 'Message not found');
  res.status(200).json(new ApiResponse(true, 200, 'Message fetched successfully', message));
});

// Create message
const createMessageController = asyncHandler(async (req: Request, res: Response) => {
  const { fromUserId, toUserId, groupId, subject, body, channel, meta, attachments } = req.body;

  if (!body || !channel) throw new ApiError(false, 400, 'Body and channel are required');

  const message = await prisma.message.create({
    data: { fromUserId, toUserId, groupId, subject, body, channel, meta, attachments },
  });

  res.status(201).json(new ApiResponse(true, 201, 'Message created successfully', message));
});

// Update message
const updateMessageController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingMessage = await prisma.message.findUnique({ where: { id } });
  if (!existingMessage) throw new ApiError(false, 404, 'Message not found');

  const updatedMessage = await prisma.message.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, 'Message updated successfully', updatedMessage));
});

// Delete message
const deleteMessageController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingMessage = await prisma.message.findUnique({ where: { id } });
  if (!existingMessage) throw new ApiError(false, 404, 'Message not found');

  await prisma.message.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, 'Message deleted successfully'));
});

// get all unread message count
const getAllUnreadMessageCountController = asyncHandler(async (req: Request, res: Response) => {
  //  @ts-ignore
  const { id } = req.user;

  if (!id) {
    throw new ApiError(false, 404, 'User must login');
  }

  const getMessages = await prisma.message.count({
    where: {
      toUserId: id,
      isRead: false,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(false, 200, 'Successfully get message notification', getMessages));
});

// get only private unread message count
const getOnlyPrivateUnreadMessageCountController = asyncHandler(
  async (req: Request, res: Response) => {
    //  @ts-ignore
    const { id } = req.user;

    if (!id) {
      throw new ApiError(false, 404, 'User must login');
    }

    const getMessages = await prisma.message.findMany({
      where: {
        toUserId: id,
        isRead: false,
      },
    });

    res
      .status(200)
      .json(new ApiResponse(false, 200, 'Successfully get message notification', getMessages));
  }
);

export {
  getAllMessagesController,
  getMessageByIdController,
  createMessageController,
  updateMessageController,
  deleteMessageController,
  getAllUnreadMessageCountController,
  getOnlyPrivateUnreadMessageCountController,
};
