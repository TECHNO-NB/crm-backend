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
exports.deleteExpenseController = exports.updateExpenseController = exports.getExpenseByIdController = exports.getAllExpensesController = exports.createExpenseController = void 0;
const db_1 = __importDefault(require("../DB/db"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Create a new expense
const createExpenseController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, category, projectId, submittedById, status, invoiceUrl, date, notes, approvedById } = req.body;
    if (!amount || !category || !status || !submittedById || !projectId) {
        throw new apiError_1.default(false, 400, "Missing required fields for creating expense");
    }
    // Validate enum
    if (!["pending", "approved", "rejected"].includes(status)) {
        throw new apiError_1.default(false, 400, "Invalid status value");
    }
    const newExpense = yield db_1.default.expense.create({
        data: {
            amount: Number(amount),
            category,
            projectId,
            submittedById,
            status: status,
            invoiceUrl,
            date: date ? new Date(date) : undefined,
            notes,
            approvedById,
        },
    });
    return res.status(201).json(new apiResponse_1.default(true, 201, "Expense created successfully", newExpense));
}));
exports.createExpenseController = createExpenseController;
// Get all expenses with optional filters
const getAllExpensesController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, submittedById, status } = req.query;
    let expenseStatus = undefined;
    if (status && typeof status === "string" && ["pending", "approved", "rejected"].includes(status)) {
        expenseStatus = status;
    }
    const expenses = yield db_1.default.expense.findMany({
        where: {
            projectId: projectId ? String(projectId) : undefined,
            submittedById: submittedById ? String(submittedById) : undefined,
            status: expenseStatus,
        },
        orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(new apiResponse_1.default(true, 200, "Fetched expenses successfully", expenses));
}));
exports.getAllExpensesController = getAllExpensesController;
// Get single expense by ID
const getExpenseByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const expense = yield db_1.default.expense.findUnique({
        where: { id },
    });
    if (!expense) {
        throw new apiError_1.default(false, 404, "Expense not found");
    }
    return res.status(200).json(new apiResponse_1.default(true, 200, "Fetched expense successfully", expense));
}));
exports.getExpenseByIdController = getExpenseByIdController;
// Update an expense
const updateExpenseController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { amount, category, projectId, status, invoiceUrl, date, notes, approvedById } = req.body;
    // Validate enum if provided
    if (status && !["pending", "approved", "rejected"].includes(status)) {
        throw new apiError_1.default(false, 400, "Invalid status value");
    }
    const updatedExpense = yield db_1.default.expense.update({
        where: { id },
        data: {
            amount: amount !== undefined ? Number(amount) : undefined,
            category,
            projectId,
            status: status,
            invoiceUrl,
            date: date ? new Date(date) : undefined,
            notes,
            approvedById,
        },
    });
    return res.status(200).json(new apiResponse_1.default(true, 200, "Expense updated successfully", updatedExpense));
}));
exports.updateExpenseController = updateExpenseController;
// Delete an expense
const deleteExpenseController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedExpense = yield db_1.default.expense.delete({
        where: { id },
    });
    return res.status(200).json(new apiResponse_1.default(true, 200, "Expense deleted successfully", deletedExpense));
}));
exports.deleteExpenseController = deleteExpenseController;
