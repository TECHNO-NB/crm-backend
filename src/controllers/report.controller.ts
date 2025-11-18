// @ts-nocheck
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import prisma from "../DB/db";
import ApiResponse from "../utils/apiResponse";

// Dashboard / summary report
const getDashboardReportController = asyncHandler(async (req: Request, res: Response) => {
  // Total Users by Role
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  // Total Projects by Status
  const projectsByStatus = await prisma.project.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  // Total Donations by Status
  const donationsByStatus = await prisma.donation.groupBy({
    by: ["status"],
    _sum: { amount: true },
    _count: { id: true },
  });

  // Total Expenses by Status
  const expensesByStatus = await prisma.expense.groupBy({
    by: ["status"],
    _sum: { amount: true },
    _count: { id: true },
  });

  // Total Donations and Expenses
  const totalDonations = await prisma.donation.aggregate({
    _sum: { amount: true },
  });
  const totalExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
  });

  res.status(200).json(
    new ApiResponse(true, 200, "Dashboard report fetched successfully", {
      usersByRole,
      projectsByStatus,
      donationsByStatus,
      expensesByStatus,
      totalDonations: totalDonations._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
    })
  );
});

// Report by Project
const getProjectReportController = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!projectId) throw new ApiError(false, 400, "Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      donations: true,
      expenses: true,
      manager: true,
      province: true,
      country: true,
    },
  });

  if (!project) throw new ApiError(false, 404, "Project not found");

  // Aggregate donations and expenses
  const totalDonations = project.donations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);

  res.status(200).json(
    new ApiResponse(true, 200, "Project report fetched successfully", {
      project,
      totalDonations,
      totalExpenses,
      balance: (totalDonations - totalExpenses),
    })
  );
});

export { getDashboardReportController, getProjectReportController };
