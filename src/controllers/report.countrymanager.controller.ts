// import { Request, Response } from 'express';
// import asyncHandler from '../utils/asyncHandler';
// import ApiResponse from '../utils/apiResponse';
// import prisma from '../DB/db';

// /**
//  * @desc Get overall financial dashboard data for a specific country
//  * @route GET /api/v1/financial/dashboard/:countryId
//  * @access Private (Admin, Chairman, Finance)
//  */
// export const getFinancialDashboardController = asyncHandler(
//   async (req: Request, res: Response): Promise<any> => {
//     // 🚨 Extract countryId from URL parameters
//     const { countryId } = req.params as { countryId: string };

//     // Common WHERE clause for filtering by country
//     const countryFilter = { countryId };

//     // === 1️⃣ Aggregate Totals (Country-Specific) ===
//     const [totalIncome, totalExpenses] = await Promise.all([
//       prisma.donation.aggregate({
//         _sum: { amount: true },
//         where: { 
//           status: 'completed',
//           ...countryFilter // 👈 Filter Donations by countryId
//         },
//       }),
//       prisma.expense.aggregate({
//         _sum: { amount: true },
//         where: { 
//           ...countryFilter // 👈 Filter Expenses by countryId
//         },
//       }),
//     ]);

//     const netBalance = (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

//     // === 2️⃣ Monthly Trend (Past 6 months - Country-Specific) ===
//     const monthlyFinancials = await prisma.$queryRaw<
//       { month: string; income: number; expenses: number }[]
//     >
//       SELECT
//         TO_CHAR("createdAt", 'Mon') AS month,
//         SUM(CASE WHEN "status"='completed' THEN amount ELSE 0 END) AS income,
//         0 AS expenses
//       FROM "Donation"
//       WHERE "createdAt" >= NOW() - INTERVAL '6 months'
//         AND "countryId" = ${countryId}  -- 👈 Country Filter for Donations
//       GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
//       UNION ALL
//       SELECT
//         TO_CHAR("date", 'Mon') AS month,
//         0 AS income,
//         SUM(amount) AS expenses
//       FROM "Expense"
//       WHERE "date" >= NOW() - INTERVAL '6 months'
//         AND "countryId" = ${countryId}  -- 👈 Country Filter for Expenses
//       GROUP BY TO_CHAR("date", 'Mon'), DATE_TRUNC('month', "date")
//       ORDER BY DATE_TRUNC('month', TO_DATE(month, 'Mon')) ASC; -- Added ORDER BY to the final result set
//     ;

//     // === 3️⃣ Expense Breakdown by Category (Top 5 - Country-Specific) ===
//     const expenseBreakdown = await prisma.expense.groupBy({
//       by: ['category'],
//       _sum: { amount: true },
//       where: {
//         ...countryFilter // 👈 Filter Expenses by countryId
//       },
//       orderBy: { _sum: { amount: 'desc' } },
//       take: 5,
//     });

//     // === 4️⃣ Income Sources by Donation Method (Top 4 - Country-Specific) ===
//     const incomeSources = await prisma.donation.groupBy({
//       by: ['method'],
//       _sum: { amount: true },
//       where: {
//         status: 'completed',
//         ...countryFilter // 👈 Filter Donations by countryId
//       },
//       orderBy: { _sum: { amount: 'desc' } },
//       take: 4,
//     });

//     // === 5️⃣ Quarterly Budget vs Actual (Projects - Country-Specific) ===
//     const quarterlyBudget = await prisma.$queryRaw<
//       { quarter: string; budget: number; actual: number }[]
//     >
//       SELECT
//         CONCAT('Q', EXTRACT(QUARTER FROM "createdAt")) AS quarter,
//         SUM(COALESCE("budget",0)) AS budget,
//         SUM(COALESCE("spent",0)) AS actual
//       FROM "Project"
//       WHERE "countryId" = ${countryId} -- 👈 Country Filter for Projects
//       GROUP BY EXTRACT(QUARTER FROM "createdAt")
//       ORDER BY quarter ASC;
//     ;

//     // === 6️⃣ Prepare JSON Response ===
//     return res.status(200).json(
//       new ApiResponse(true, 200, 'Financial dashboard fetched successfully', {
//         totalIncome: totalIncome._sum.amount || 0,
//         totalExpenses: totalExpenses._sum.amount || 0,
//         netBalance,
//         monthlyFinancials,
//         expenseBreakdown,
//         incomeSources,
//         quarterlyBudget,
//       })
//     );
//   }
// );