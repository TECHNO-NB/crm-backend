// @ts-nocheck
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import prisma from '../DB/db';
import ApiResponse from '../utils/apiResponse';
import { uploadToCloudinary } from '../utils/cloudinary';

// Create Project
const createProjectController = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    provinceId,
    managerId,
    status,
    startDate,
    endDate,
    budget,
    countryId,
    workers,
  } = req.body;

  if (!title || !status || !countryId) {
    throw new ApiError(false, 400, 'Title, status, and countryId are required');
  }

  let documentUrls: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const uploadResult = await uploadToCloudinary(file.path);
      documentUrls.push(uploadResult);
    }
  }

  let workersToConnect = undefined;

  if (workers) {
    const workerArray = typeof workers === 'string' ? JSON.parse(workers) : workers;

    if (Array.isArray(workerArray) && workerArray.length > 0) {
      workersToConnect = workerArray.map((id) => ({ id }));
    }
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
      documents: documentUrls,

      ...(workersToConnect && {
        workers: {
          connect: workersToConnect,
        },
      }),
    },
    include: {
      workers: true,
      manager: true,
      province: true,
    },
  });

  res.status(201).json(new ApiResponse(true, 201, 'Project created successfully', project));
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
      expenses: true,
      workers: true, // Include assigned users
    },
  });

  res.status(200).json(new ApiResponse(true, 200, 'Projects fetched successfully', projects));
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

  if (!project) throw new ApiError(false, 404, 'Project not found');

  res.status(200).json(new ApiResponse(true, 200, 'Project fetched successfully', project));
});

// ==========================================================
// Update Project
// ==========================================================
// Update Project (matching EditProjectModal)
const updateProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    provinceId,
    managerId,
    status,
    startDate,
    endDate,
    budget,
    spent,
    workers,
    existingDocs,
  } = req.body;

  // Handle documents upload
  let newDocuments: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const uploadedUrl = await uploadToCloudinary(file.path);
      newDocuments.push(uploadedUrl);
    }
  }

  // Merge existingDocs and newDocuments
  const finalDocuments = Array.isArray(existingDocs)
    ? [...existingDocs, ...newDocuments]
    : [...newDocuments];

  // Handle workers array
  let workersToConnect = undefined;
  if (workers) {
    const workerArray = typeof workers === "string" ? JSON.parse(workers) : workers;
    if (Array.isArray(workerArray) && workerArray.length > 0) {
      workersToConnect = workerArray.map((id) => ({ id }));
    }
  }

  const updatedProject = await prisma.project.update({
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
      documents: finalDocuments,

      ...(workersToConnect && {
        workers: {
          set: workersToConnect, // Replace old workers with new ones
        },
      }),
    },
    include: {
      workers: true,
      manager: true,
      province: true,
      country: true,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(true, 200, "Project updated successfully", updatedProject));
});


// ==========================================================
// Update Project Status Or review Project
// ==========================================================
const updateStatusProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved } = req.body;

  const project = await prisma.project.update({
    where: { id },
    data: {
      approved,
    },
  });

  res.status(200).json(new ApiResponse(true, 200, 'Project updated successfully', project));
});

// ==========================================================
// Delete Project
// ==========================================================
const deleteProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.project.delete({ where: { id } });

  res.status(200).json(new ApiResponse(true, 200, 'Project deleted successfully', null));
});

// ==========================================================
// Add User to Project (Admin or Country Manager Only)
// ==========================================================
const addUserToProjectController = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, userId } = req.body;
  const userRole = req.user?.role; // assuming you attach user info in middleware

  if (!projectId || !userId) {
    throw new ApiError(false, 400, 'projectId and userId are required');
  }

  // Only admin or country_manager can assign users
  if (userRole !== 'admin' && userRole !== 'country_manager') {
    throw new ApiError(
      false,
      403,
      'Access denied: only admin or country manager can assign users to a project'
    );
  }

  // Check project existence
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workers: true },
  });

  if (!project) throw new ApiError(false, 404, 'Project not found');

  // Check user existence
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(false, 404, 'User not found');

  // Check if already assigned
  const alreadyAssigned = project.workers.some((worker) => worker.id === userId);
  if (alreadyAssigned) {
    throw new ApiError(false, 400, 'User is already assigned to this project');
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

  res
    .status(200)
    .json(new ApiResponse(true, 200, 'User added to project successfully', updatedProject));
});

export {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  addUserToProjectController,
  updateStatusProjectController
};
