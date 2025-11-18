import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Fetch all events
const getAllEventsController = asyncHandler(async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    include: { organizer: true },
    orderBy: { startAt: "desc" },
  });
  res.status(200).json(new ApiResponse(true, 200, "Events fetched successfully", events));
});

// Fetch single event
const getEventByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { organizer: true },
  });
  if (!event) throw new ApiError(false, 404, "Event not found");
  res.status(200).json(new ApiResponse(true, 200, "Event fetched successfully", event));
});

// Create event
const createEventController = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, startAt, endAt, organizerId, attendees, location, attachments } = req.body;
  if (!title || !startAt) throw new ApiError(false, 400, "Title and startAt are required");

  const event = await prisma.event.create({
    data: { title, description, startAt: new Date(startAt), endAt: endAt ? new Date(endAt) : null, organizerId, attendees, location, attachments },
  });

  res.status(201).json(new ApiResponse(true, 201, "Event created successfully", event));
});

// Update event
const updateEventController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) throw new ApiError(false, 404, "Event not found");

  const updatedEvent = await prisma.event.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(true, 200, "Event updated successfully", updatedEvent));
});

// Delete event
const deleteEventController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) throw new ApiError(false, 404, "Event not found");

  await prisma.event.delete({ where: { id } });
  res.status(200).json(new ApiResponse(true, 200, "Event deleted successfully"));
});

export { getAllEventsController, getEventByIdController, createEventController, updateEventController, deleteEventController };
