// controllers/dashboardController.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import prisma from "../DB/db";

const getOneCountryFinanceDetails = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { countryId } = req.params;

    // 1️⃣ Total Donations for that country
    const totalDonation = await prisma.$queryRaw`
      SELECT COALESCE(SUM(d."amount"), 0) AS total_donations
      FROM "Donation" AS d
      WHERE d."countryId" = ${countryId};
    `;

    // 2️⃣ Total Approved Expenses for that country
    const totalExpenses = await prisma.$queryRaw`
      SELECT COALESCE(SUM(e."amount"), 0) AS total_expenses
      FROM "Expense" AS e
      WHERE e.status = 'approved'
      AND e."countryId" = ${countryId};
    `;

    // 3️⃣ Top Expense Categories (approved only) for that country
    const topExpensesCategory = await prisma.$queryRaw`
      SELECT 
        e."category" AS category,
        COALESCE(SUM(e."amount"), 0) AS total_amount
      FROM "Expense" AS e
      WHERE e.status = 'approved'
      AND e."countryId" = ${countryId}
      GROUP BY e."category"
      ORDER BY total_amount DESC;
    `;

    // 4️⃣ Net Balance
    const netBalance =
      totalDonation[0].total_donations -
      totalExpenses[0].total_expenses;

    res.status(200).json({
      success: true,
      data: {
        totalDonationIncome: totalDonation,
        totalExpenses: totalExpenses,
        netBalance,
        topExpensesCategory,
      },
    });
  }
);

export { getOneCountryFinanceDetails };
