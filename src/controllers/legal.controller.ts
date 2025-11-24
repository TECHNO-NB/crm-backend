// @ts-nocheck
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js'; // Ensure the path is correct
import ApiResponse from '../utils/apiResponse.js'; // Ensure the path is correct
import prisma from '../DB/db.js'; // Ensure the path is correct
import { uploadToCloudinary } from '../utils/cloudinary.js'; // Create this utility
import { LegalCaseStatus, LegalPriority } from '@prisma/client';

// --- 1. ADD LegalCase (Including File Upload) ---
export const addLegalCaseController = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore - Assuming user is attached by 'protect' middleware
  const { id: submittedById, countryId: userCountryId } = req.user;

  // Data from request body
  const {
    title,
    description,
    category,
    priority,
    status,
    applicantId,
    respondentId,
    assignedToId,
    provinceId,
    filingDate,
    hearingDates,
    notes,
  } = req.body;

  // Ensure mandatory fields are present
  if (!title || !category) {
    return res
      .status(400)
      .json(new ApiResponse(false, 400, 'Title and Category are required.', null));
  }

  let documents = [];

  // 📝 Handle File Upload (Multer & Cloudinary)
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.path, 'legal-documents')
    );
    const uploadedDocuments = await Promise.all(uploadPromises);

    // Collect the secure URLs from the upload response
    documents = uploadedDocuments.filter((url) => url).map((upload) => upload || upload);
  }

  // 🛠️ Prepare data for Prisma
  const newCase = await prisma.legalCase.create({
    data: {
      title,
      description,
      category,
      priority: priority || LegalPriority.medium, // Default to medium
      status: status || LegalCaseStatus.open, // Default to open

      // User Relations
      applicantId: applicantId || submittedById, // Default applicant to the submitting user
      respondentId,
      assignedToId,

      // Location (countryId is mandatory, provinceId is optional)
      countryId: userCountryId, // Use the countryId from the submitting user
      provinceId,

      // Dates & Arrays
      filingDate: filingDate ? new Date(filingDate) : new Date(),
      hearingDates: Array.isArray(hearingDates) ? hearingDates.map((d) => new Date(d)) : [],
      notes: Array.isArray(notes) ? notes : notes ? [notes] : [],
      documents, // Array of uploaded Cloudinary URLs
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Legal Case created successfully.', newCase));
});

// --- 2. FETCH LegalCases (List and Filter) ---
export const fetchLegalCasesController = asyncHandler(async (req, res): Promise<any> => {
  // @ts-ignore
  const { id, role } = req.user;
  const {
    status,
    priority,
    category,
    countryId,
    provinceId,
    search,
    page = 1,
    limit = 10,
  } = req.query;
  //  @ts-ignore
  const skip = (parseInt(page) - 1) * parseInt(limit);
  //  @ts-ignore
  const take = parseInt(limit);

  // Define a base filter for the query
  const where = {
    // General Filters
    ...(status && { status: status }),
    ...(priority && { priority: priority }),
    ...(category && { category: category }),
    ...(countryId && { countryId: countryId }),
    ...(provinceId && { provinceId: provinceId }),

    // Search filter across title and caseNumber
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
      ],
    }),

    // Role-based visibility logic (optional, but good practice)
    // Example: Only show cases assigned to the user if they are 'legal'
    ...(role === 'legal' && { assignedToId: id }),
  };

  const [cases, total] = await prisma.$transaction([
    prisma.legalCase.findMany({
      //  @ts-ignore
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: { select: { fullName: true } },
        assignedTo: { select: { fullName: true, role: true } },
        country: { select: { countryName: true } },
      },
    }),
    //  @ts-ignore
    prisma.legalCase.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(true, 200, 'Legal Cases fetched successfully.', {
      cases,
      //  @ts-ignore
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / take),
      totalCases: total,
    })
  );
});

// --- 3. FETCH Single LegalCase ---
export const getLegalCaseByIdController = asyncHandler(async (req, res): Promise<any> => {
  const { caseId } = req.params;

  const legalCase = await prisma.legalCase.findUnique({
    where: { id: caseId },
    include: {
      applicant: { select: { fullName: true, email: true } },
      respondent: { select: { fullName: true, email: true } },
      assignedTo: { select: { fullName: true, role: true, phone: true } },
      country: { select: { countryName: true } },
      province: { select: { name: true } },
    },
  });

  if (!legalCase) {
    return res.status(404).json(new ApiResponse(false, 404, 'Legal Case not found.', null));
  }

  return res.status(200).json(new ApiResponse(true, 200, 'Legal Case details fetched.', legalCase));
});

// --- 4. EDIT LegalCase Details (excluding status/files) ---
export const editLegalCaseController = asyncHandler(async (req, res): Promise<any> => {
  const { caseId } = req.params;
  const updateData = req.body;

  // Optional: Filter out non-updatable fields like ID, createdAt, updatedAt
  delete updateData.id;
  delete updateData.createdAt;

  // Format dates if they are being updated
  if (updateData.filingDate) {
    updateData.filingDate = new Date(updateData.filingDate);
  }
  if (updateData.closedDate) {
    updateData.closedDate = new Date(updateData.closedDate);
  }
  if (updateData.hearingDates && Array.isArray(updateData.hearingDates)) {
    updateData.hearingDates = updateData.hearingDates.map((d) => new Date(d));
  }

  const updatedCase = await prisma.legalCase.update({
    where: { id: caseId },
    data: updateData,
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Legal Case updated successfully.', updatedCase));
});

// --- 5. CHANGE LegalCase Status ---
export const changeLegalCaseStatusController = asyncHandler(async (req, res): Promise<any> => {
  const { caseId } = req.params;
  const { newStatus } = req.body;

  // Input validation: Check if newStatus is a valid enum value
  if (!Object.values(LegalCaseStatus).includes(newStatus)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          false,
          400,
          `Invalid status value. Must be one of: ${Object.values(LegalCaseStatus).join(', ')}.`,
          null
        )
      );
  }

  const updatedCase = await prisma.legalCase.update({
    where: { id: caseId },
    data: { status: newStatus },
    select: { id: true, caseNumber: true, title: true, status: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, `Status changed to ${newStatus}.`, updatedCase));
});

// --- 6. DELETE LegalCase ---
export const deleteLegalCaseController = asyncHandler(async (req, res): Promise<any> => {
  const { caseId } = req.params;

  // Optional: Before deleting, you might want to delete files from Cloudinary too.
  // For simplicity, we skip Cloudinary deletion here.

  await prisma.legalCase.delete({
    where: { id: caseId },
  });

  return res.status(204).json(new ApiResponse(true, 204, 'Legal Case deleted successfully.', null));
});
