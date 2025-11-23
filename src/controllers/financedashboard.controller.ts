// controllers/dashboardController.ts
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import prisma from '../DB/db';

const getAllCountryFinanceDetails = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // 1️⃣ Top Performer Countries Query
    const getTopPerformerCountry = await prisma.$queryRaw`
      SELECT 
        c.id AS country_id,
        c."countryName" AS country_name,
        u."fullName" AS manager_name,
        u."avatarUrl" AS avatar,

        COALESCE(SUM(d.amount), 0) AS total_donations,

        -- include ONLY approved expenses
        COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) AS total_expenses,

        (
          COALESCE(SUM(d.amount), 0) -
          COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0)
        ) AS net_balance

      FROM "Country" c
      
      LEFT JOIN "User" u 
        ON u."countryId" = c.id 
        AND u.role = 'country_manager'

      LEFT JOIN "Project" p 
        ON p."countryId" = c.id

      LEFT JOIN "Donation" d 
        ON d."projectId" = p.id

      LEFT JOIN "Expense" e 
        ON e."countryId" = c.id  -- FIXED join + only approved in SUM

      GROUP BY 
        c.id, 
        c."countryName", 
        u."fullName",
        u."avatarUrl"

      ORDER BY net_balance DESC;
    `;

    // 2️⃣ Total Donations
    const totalDonation = await prisma.$queryRaw`
      SELECT COALESCE(SUM(d."amount"),0) AS total_donations
      FROM "Donation" AS d;
    `;

    // 3️⃣ Total Approved Expenses
    const totalExpenses = await prisma.$queryRaw`
      SELECT COALESCE(SUM(e."amount"),0) AS total_expenses
      FROM "Expense" AS e
      WHERE e.status = 'approved';
    `;

    // 4️⃣ Top Expense Categories (approved only)
    const topExpensesCategory = await prisma.$queryRaw`
      SELECT 
        e."category" AS category,
        COALESCE(SUM(e."amount"), 0) AS total_amount
      FROM "Expense" AS e
      WHERE e.status = 'approved'
      GROUP BY e."category"
      ORDER BY total_amount DESC;
    `;

    // 5️⃣ Net Balance
    const netBalance =
      totalDonation[0].total_donations - totalExpenses[0].total_expenses;

    res.status(200).json({
      success: true,
      data: {
        topPerformerCountry: getTopPerformerCountry,
        totalDonationIncome: totalDonation,
        totalExpenses: totalExpenses,
        netBalance: netBalance,
        topExpensesCategory,
      },
    });
  }
);

export { getAllCountryFinanceDetails };
