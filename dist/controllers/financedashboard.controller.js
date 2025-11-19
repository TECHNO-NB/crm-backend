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
exports.getAllCountryFinanceDetails = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const db_1 = __importDefault(require("../DB/db"));
const getAllCountryFinanceDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getTopPerformerCountry = yield db_1.default.$queryRaw `
  SELECT 
    c.id AS country_id,
    c."countryName" AS country_name,
    u."fullName" AS manager_name,
    u."avatarUrl" AS avatar,

    COALESCE(SUM(d.amount), 0) AS total_donations,
    COALESCE(SUM(e.amount), 0) AS total_expenses,

    (COALESCE(SUM(d.amount), 0) - COALESCE(SUM(e.amount), 0)) AS net_balance

  FROM "Country" c
  
  LEFT JOIN "User" u 
    ON u."countryId" = c.id 
    AND u.role = 'country_manager'

  LEFT JOIN "Project" p 
    ON p."countryId" = c.id

  LEFT JOIN "Donation" d 
    ON d."projectId" = p.id

  LEFT JOIN "Expense" e 
    ON e."projectId" = p.id

  GROUP BY 
    c.id, 
    c."countryName", 
    u."fullName",
    u."avatarUrl"


  ORDER BY net_balance DESC;
`;
    const totalDonation = yield db_1.default.$queryRaw `
  SELECT  COALESCE(SUM(d."amount"),0) AS total_donations FROM "Donation" AS d;
  `;
    const totalExpenses = yield db_1.default.$queryRaw `
  SELECT COALESCE(SUM(e."amount"),0) AS total_expenses FROM "Expense" AS e;
  
  `;
    const topExpensesCategory = yield db_1.default.$queryRaw `
  SELECT 
    e."category" AS category,
    COALESCE(SUM(e."amount"), 0) AS total_amount
  FROM "Expense" AS e
  GROUP BY e."category"
  ORDER BY total_amount DESC;
`;
    const netBalance = totalDonation[0].total_donations - totalExpenses[0].total_expenses;
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
}));
exports.getAllCountryFinanceDetails = getAllCountryFinanceDetails;
