// controllers/ticket.controller.ts
import { Request, Response } from "express";
import prisma from "../DB/db";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { uploadToCloudinary, deleteCloudinaryImage } from "../utils/cloudinary";

// 📌 1. Get all tickets
export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    include: {
      requester: true,
      assignee: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(new ApiResponse(true,200,  "Tickets fetched successfully",tickets,));
});

// 📌 2. Create ticket
export const createTicket = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, requesterId, assigneeId, priority } = req.body;

    let uploadedFiles: string[] = [];

    // Upload attachments if any
    if (req.files) {
      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        const upload = await uploadToCloudinary(file.path);
        uploadedFiles.push(upload);
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        requesterId,
        assigneeId,
        priority,
        status: "open",
        attachments: uploadedFiles,
        logs: [{ message: "Ticket created", at: new Date() }],
      },
    });

    res.json(new ApiResponse(true,201,  "Ticket created successfully",ticket));
  }
);

// 📌 3. Update ticket
export const updateTicket = asyncHandler(
  async (req: Request, res: Response):Promise<any> => {
    const { title, description, requesterId, assigneeId, priority, status } =
      req.body;

    const ticketId = req.params.id;

    // Find existing ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket)
      return res
        .status(404)
        .json(new ApiResponse(false,404, "Ticket not found"));

    let newFiles: string[] = ticket.attachments;

    // If new attachments are uploaded
    if (req.files) {
      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        const uploaded = await uploadToCloudinary(file.path);
        newFiles.push(uploaded);
      }
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title,
        description,
        requesterId,
        assigneeId,
        priority,
        status,
        attachments: newFiles,
        logs: [
            { message: "Ticket updated", at: new Date() },
        ],
      },
    });

    res.json(new ApiResponse(true,200, "Ticket updated successfully",updated));
  }
);

// 📌 4. Delete ticket
export const deleteTicket = asyncHandler(
  async (req: Request, res: Response):Promise<any> => {
    const ticketId = req.params.id;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket)
      return res
        .status(404)
        .json(new ApiResponse(false,404, "Ticket not found"));

    // Delete attachments from Cloudinary
    for (const file of ticket.attachments) {
      await deleteCloudinaryImage(file);
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    res.json(new ApiResponse(true,200, "Ticket deleted successfully"));
  }
);
