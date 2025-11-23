import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import prisma from '../DB/db';

export const getFinancialDashboardController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { countryId } = req.params;

    // === 1️⃣ Aggregate Totals (Country Wise) ===
    const [totalIncome, totalExpenses] = await Promise.all([
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'completed', countryId },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { countryId, status: 'approved' },  // <-- FIXED
      }),
    ]);

    const netBalance =
      (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

    // === 2️⃣ Monthly Trend (Past 6 months, Country Wise) ===
    const monthlyFinancials = await prisma.$queryRaw<
      { month: string; income: number; expenses: number }[]
    >`
      SELECT
        TO_CHAR("createdAt", 'Mon') AS month,
        SUM(CASE WHEN "status"='completed' THEN amount ELSE 0 END) AS income,
        0 AS expenses
      FROM "Donation"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      AND "countryId" = ${countryId}
      GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")

      UNION ALL

      SELECT
        TO_CHAR("date", 'Mon') AS month,
        0 AS income,
        SUM(amount) AS expenses
      FROM "Expense"
      WHERE "date" >= NOW() - INTERVAL '6 months'
      AND "countryId" = ${countryId}
      AND "status" = 'approved'                 -- <-- FIXED
      GROUP BY TO_CHAR("date", 'Mon'), DATE_TRUNC('month', "date");
    `;

    // === 3️⃣ Expense Breakdown by Category (Country Wise) ===
    const expenseBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: { countryId, status: 'approved' },   // <-- FIXED
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // === 4️⃣ Income Sources by Method (Country Wise) ===
    const incomeSources = await prisma.donation.groupBy({
      by: ['method'],
      where: { countryId },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 4,
    });

    // === 5️⃣ Quarterly Budget vs Actual (Country Wise Projects) ===
    const quarterlyBudget = await prisma.$queryRaw<
      { quarter: string; budget: number; actual: number }[]
    >`
      SELECT
        CONCAT('Q', EXTRACT(QUARTER FROM "createdAt")) AS quarter,
        SUM(COALESCE("budget",0)) AS budget,
        SUM(COALESCE("spent",0)) AS actual
      FROM "Project"
      WHERE "countryId" = ${countryId}
      GROUP BY EXTRACT(QUARTER FROM "createdAt")
      ORDER BY quarter ASC;
    `;

    // === 6️⃣ Final JSON Response ===
    return res.status(200).json(
      new ApiResponse(true, 200, 'Financial dashboard fetched successfully', {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netBalance,
        monthlyFinancials,
        expenseBreakdown,
        incomeSources,
        quarterlyBudget,
      })
    );
  }
);
