// @ts-nocheck
import { Request, Response } from "express";
import prisma from "../DB/db";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";

// Fetch all donations with optional filters
const getAllDonations = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { projectId, status, donorEmail } = req.query;

  const donations = await prisma.donation.findMany({
    where: {
      projectId: projectId ? String(projectId) : undefined,
      // @ts-ignore
      status: status ? String(status) : undefined,
      donorEmail: donorEmail ? String(donorEmail) : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, "Fetched all donations successfully", donations));
});

// Fetch single donation by ID
const getDonationById = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) throw new ApiError(false, 404, "Donation not found");

  return res
    .status(200)
    .json(new ApiResponse(true, 200, "Fetched donation successfully", donation));
});

// Create a new donation
const createDonation = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    method,
    status,
    receivedAt,
    projectId,
    receiptUrl,
    note,
    invoiceNo,
  } = req.body;

  if (!donorName || !amount || !method || !status) {
    throw new ApiError(false, 400, "Please provide required fields");
  }

  const donation = await prisma.donation.create({
    data: {
      donorName,
      donorEmail,
      donorPhone,
      amount: Number(amount),
      method,
      status,
      receivedAt: receivedAt ? new Date(receivedAt) : undefined,
      projectId,
      receiptUrl,
      note,
      invoiceNo,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(true, 201, "Donation created successfully", donation));
});

// Update donation
const updateDonation = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    method,
    status,
    receivedAt,
    projectId,
    receiptUrl,
    note,
    invoiceNo,
  } = req.body;

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) throw new ApiError(false, 404, "Donation not found");

  const updatedDonation = await prisma.donation.update({
    where: { id },
    data: {
      donorName: donorName ?? donation.donorName,
      donorEmail: donorEmail ?? donation.donorEmail,
      donorPhone: donorPhone ?? donation.donorPhone,
      amount: amount !== undefined ? Number(amount) : donation.amount,
      method: method ?? donation.method,
      status: status ?? donation.status,
      receivedAt: receivedAt ? new Date(receivedAt) : donation.receivedAt,
      projectId: projectId ?? donation.projectId,
      receiptUrl: receiptUrl ?? donation.receiptUrl,
      note: note ?? donation.note,
      invoiceNo: invoiceNo ?? donation.invoiceNo,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, "Donation updated successfully", updatedDonation));
});

// Delete donation
const deleteDonation = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) throw new ApiError(false, 404, "Donation not found");

  await prisma.donation.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, "Donation deleted successfully", null));
});

export {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
};
