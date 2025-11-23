"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialDashboardController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const db_1 = __importDefault(require("../DB/db"));
exports.getFinancialDashboardController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryId } = req.params;
    // === 1️⃣ Aggregate Totals (Country Wise) ===
    const [totalIncome, totalExpenses] = yield Promise.all([
        db_1.default.donation.aggregate({
            _sum: { amount: true },
            where: { status: 'completed', countryId },
        }),
        db_1.default.expense.aggregate({
            _sum: { amount: true },
            where: { countryId, status: 'approved' }, // <-- FIXED
        }),
    ]);
    const netBalance = (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);
    // === 2️⃣ Monthly Trend (Past 6 months, Country Wise) ===
    const monthlyFinancials = yield db_1.default.$queryRaw `
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
    const expenseBreakdown = yield db_1.default.expense.groupBy({
        by: ['category'],
        where: { countryId, status: 'approved' }, // <-- FIXED
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
    });
    // === 4️⃣ Income Sources by Method (Country Wise) ===
    const incomeSources = yield db_1.default.donation.groupBy({
        by: ['method'],
        where: { countryId },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 4,
    });
    // === 5️⃣ Quarterly Budget vs Actual (Country Wise Projects) ===
    const quarterlyBudget = yield db_1.default.$queryRaw `
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
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Financial dashboard fetched successfully', {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netBalance,
        monthlyFinancials,
        expenseBreakdown,
        incomeSources,
        quarterlyBudget,
    }));
}));
