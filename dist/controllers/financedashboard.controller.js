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
exports.getProjectFinancials = exports.getDashboardData = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const db_1 = __importDefault(require("../DB/db"));
/**
 * @desc Get dashboard summary for financial, projects, donations, expenses
 * @route GET /api/v1/dashboard
 * @access Private (Admin, Finance, Chairman, Country Manager)
 */
exports.getDashboardData = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Total users by role
    const usersByRole = yield db_1.default.user.groupBy({
        by: ['role'],
        _count: { role: true },
    });
    // Projects summary
    const projectsSummary = yield db_1.default.project.groupBy({
        by: ['status'],
        _count: { status: true },
    });
    // Total donations and pending donations
    const donations = yield db_1.default.donation.groupBy({
        by: ['status'],
        _sum: { amount: true },
    });
    // Total expenses by status
    const expenses = yield db_1.default.expense.groupBy({
        by: ['status'],
        _sum: { amount: true },
    });
    // Top performing manager by total project spent amount
    const topManager = yield db_1.default.user.findFirst({
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
    const countryPerformance = yield db_1.default.country.findMany({
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
}));
/**
 * @desc Get detailed project financials
 * @route GET /api/v1/projects/:id/financials
 * @access Private
 */
exports.getProjectFinancials = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const project = yield db_1.default.project.findUnique({
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
}));
