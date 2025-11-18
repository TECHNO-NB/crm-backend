// @ts-nocheck
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Fetch all tickets
const getAllTicketsController = asyncHandler(async (req: Request, res: Response) => {
  const tickets = await prisma.ticket.findMany({ include: { requester: true, assignee: true }, orderBy: { createdAt: "desc" } });
  res.status(200).json(new ApiResponse(true, 200, "Tickets fetched successfully", tickets));
});

// Fetch single ticket
const getTicketByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { requester: true, assignee: true } });
  if (!ticket) throw new ApiError(false, 404, "Ticket not found");
  res.status(200).json(new ApiResponse(true, 200, "Ticket fetched successfully", ticket));
});

// Create ticket
const createTicketController = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, requesterId, assigneeId, priority, status, logs, attachments } = req.body;
  if (!title || !status) throw new ApiError(false, 400, "Title and status are required");

  const ticket = await prisma.ticket.create({ data: { title, description, requesterId, assigneeId, priority, status, logs, attachments } });
  res.status(201).json(new ApiResponse(true, 201, "Ticket created successfully", ticket));
});

// Update ticket
const updateTicketController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingTicket = await prisma.ticket.findUnique({ where: { id } });
  if (!existingTicket) throw new ApiError(false, 404, "Ticket not found");

  const updatedTicket = await prisma.ticket.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, "Ticket updated successfully", updatedTicket));
});

// Delete ticket
const deleteTicketController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingTicket = await prisma.ticket.findUnique({ where: { id } });
  if (!existingTicket) throw new ApiError(false, 404, "Ticket not found");

  await prisma.ticket.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, "Ticket deleted successfully"));
});

export { getAllTicketsController, getTicketByIdController, createTicketController, updateTicketController, deleteTicketController };
