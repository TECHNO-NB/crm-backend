// @ts-nocheck
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// ==========================================================
// Create Project
// ==========================================================

const createProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, provinceId, managerId, status, startDate, endDate, budget, countryId } = req.body;

  if (!title || !status || !countryId) {
    throw new ApiError(false, 400, "Title, status, and countryId are required");
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      provinceId,
      managerId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? Number(budget) : undefined,
      countryId,
    },
  });

  res.status(201).json(new ApiResponse(true, 201, "Project created successfully", project));
});

// ==========================================================
// Get All Projects
// ==========================================================
const getAllProjectsController = asyncHandler(async (req: Request, res: Response) => {
   const { status, managerId } = req.query;

  const projects = await prisma.project.findMany({
    where: {
      // @ts-ignore
      status: status ? String(status) : undefined,
      managerId: managerId ? String(managerId) : undefined,
    },
    include: {
      manager: true,
      province: true,
      country: true,
      donations: true,
      // expenses: true,
      workers: true, // Include assigned users
    },
  });

  res.status(200).json(new ApiResponse(true, 200, "Projects fetched successfully", projects));
});

// ==========================================================
// Get Project By ID
// ==========================================================
const getProjectByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      manager: true,
      province: true,
      country: true,
      donations: true,
      expenses: true,
      workers: true, // Include assigned users
    },
  });

  if (!project) throw new ApiError(false, 404, "Project not found");

  res.status(200).json(new ApiResponse(true, 200, "Project fetched successfully", project));
});

// ==========================================================
// Update Project
// ==========================================================
const updateProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, provinceId, managerId, status, startDate, endDate, budget, spent } = req.body;

  const project = await prisma.project.update({
    where: { id },
    data: {
      title,
      description,
      provinceId,
      managerId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? Number(budget) : undefined,
      spent: spent ? Number(spent) : undefined,
    },
  });

  res.status(200).json(new ApiResponse(true, 200, "Project updated successfully", project));
});

// ==========================================================
// Delete Project
// ==========================================================
const deleteProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.project.delete({ where: { id } });

  res.status(200).json(new ApiResponse(true, 200, "Project deleted successfully", null));
});

// ==========================================================
// Add User to Project (Admin or Country Manager Only)
// ==========================================================
const addUserToProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, userId } = req.body;
  const userRole = req.user?.role; // assuming you attach user info in middleware

  if (!projectId || !userId) {
    throw new ApiError(false, 400, "projectId and userId are required");
  }

  // Only admin or country_manager can assign users
  if (userRole !== "admin" && userRole !== "country_manager") {
    throw new ApiError(false, 403, "Access denied: only admin or country manager can assign users to a project");
  }

  // Check project existence
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workers: true },
  });

  if (!project) throw new ApiError(false, 404, "Project not found");

  // Check user existence
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(false, 404, "User not found");

  // Check if already assigned
  const alreadyAssigned = project.workers.some((worker) => worker.id === userId);
  if (alreadyAssigned) {
    throw new ApiError(false, 400, "User is already assigned to this project");
  }

  // Add user to project workers
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      workers: {
        connect: { id: userId },
      },
    },
    include: { workers: true },
  });

  res.status(200).json(new ApiResponse(true, 200, "User added to project successfully", updatedProject));
});

export {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  addUserToProjectController,
};
