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
exports.getProjectReportController = exports.getDashboardReportController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Dashboard / summary report
const getDashboardReportController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Total Users by Role
    const usersByRole = yield db_1.default.user.groupBy({
        by: ["role"],
        _count: { id: true },
    });
    // Total Projects by Status
    const projectsByStatus = yield db_1.default.project.groupBy({
        by: ["status"],
        _count: { id: true },
    });
    // Total Donations by Status
    const donationsByStatus = yield db_1.default.donation.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: { id: true },
    });
    // Total Expenses by Status
    const expensesByStatus = yield db_1.default.expense.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: { id: true },
    });
    // Total Donations and Expenses
    const totalDonations = yield db_1.default.donation.aggregate({
        _sum: { amount: true },
    });
    const totalExpenses = yield db_1.default.expense.aggregate({
        _sum: { amount: true },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, "Dashboard report fetched successfully", {
        usersByRole,
        projectsByStatus,
        donationsByStatus,
        expensesByStatus,
        totalDonations: totalDonations._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
    }));
}));
exports.getDashboardReportController = getDashboardReportController;
// Report by Project
const getProjectReportController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId)
        throw new apiError_1.default(false, 400, "Project ID is required");
    const project = yield db_1.default.project.findUnique({
        where: { id: projectId },
        include: {
            donations: true,
            expenses: true,
            manager: true,
            province: true,
            country: true,
        },
    });
    if (!project)
        throw new apiError_1.default(false, 404, "Project not found");
    // Aggregate donations and expenses
    const totalDonations = project.donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);
    res.status(200).json(new apiResponse_1.default(true, 200, "Project report fetched successfully", {
        project,
        totalDonations,
        totalExpenses,
        balance: (totalDonations - totalExpenses),
    }));
}));
exports.getProjectReportController = getProjectReportController;
