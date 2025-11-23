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
exports.getOneCountryFinanceDetails = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const db_1 = __importDefault(require("../DB/db"));
const getOneCountryFinanceDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryId } = req.params;
    // 1️⃣ Total Donations for that country
    const totalDonation = yield db_1.default.$queryRaw `
      SELECT COALESCE(SUM(d."amount"), 0) AS total_donations
      FROM "Donation" AS d
      WHERE d."countryId" = ${countryId};
    `;
    // 2️⃣ Total Approved Expenses for that country
    const totalExpenses = yield db_1.default.$queryRaw `
      SELECT COALESCE(SUM(e."amount"), 0) AS total_expenses
      FROM "Expense" AS e
      WHERE e.status = 'approved'
      AND e."countryId" = ${countryId};
    `;
    // 3️⃣ Top Expense Categories (approved only) for that country
    const topExpensesCategory = yield db_1.default.$queryRaw `
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
    const netBalance = totalDonation[0].total_donations -
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
}));
exports.getOneCountryFinanceDetails = getOneCountryFinanceDetails;
