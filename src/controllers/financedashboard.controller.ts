// controllers/dashboardController.ts
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import prisma from '../DB/db';

/**
 * @desc Get dashboard summary for financial, projects, donations, expenses
 * @route GET /api/v1/dashboard
 * @access Private (Admin, Finance, Chairman, Country Manager)
 */
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  // Total users by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });

  // Projects summary
  const projectsSummary = await prisma.project.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  // Total donations and pending donations
  const donations = await prisma.donation.groupBy({
    by: ['status'],
    _sum: { amount: true },
  });

  // Total expenses by status
  const expenses = await prisma.expense.groupBy({
    by: ['status'],
    _sum: { amount: true },
  });

  // Top performing manager by total project spent amount
  const topManager = await prisma.user.findFirst({
    where: { managedProjects: { some: {} } },
    orderBy: {
      managedProjects: {
        _sum: { spent: 'desc' },
      },
    },
    include: {
      managedProjects: true,
    },
  });

  // Country-wise financial summary
  const countryPerformance = await prisma.country.findMany({
    include: {
      projects: {
        select: {
          title: true,
          budget: true,
          spent: true,
          donations: { select: { amount: true } },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      usersByRole,
      projectsSummary,
      donations,
      expenses,
      topManager,
      countryPerformance,
    },
  });
});

/**
 * @desc Get detailed project financials
 * @route GET /api/v1/projects/:id/financials
 * @access Private
 */
export const getProjectFinancials = asyncHandler(async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      donations: true,
      expenses: true,
    },
  });

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const totalDonations = project.donations.reduce((acc, d) => acc + d.amount, 0);
  const totalExpenses = project.expenses.reduce((acc, e) => acc + e.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      projectId: project.id,
      projectTitle: project.title,
      totalDonations,
      totalExpenses,
      balance: totalDonations - totalExpenses,
    },
  });
});
