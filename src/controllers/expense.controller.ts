import { Request, Response } from 'express';
import prisma from '../DB/db';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { uploadToCloudinary } from '../utils/cloudinary';

// Create a new expense
const createExpenseController = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { amount, category, submittedById, date, notes, countryId } = req.body;

  if (!amount || !category || !submittedById) {
    throw new ApiError(false, 400, 'Missing required fields for creating expense');
  }

  const finalDate: Date | undefined = date ? new Date(date) : undefined;

  let invoiceUrl: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const uploadResult = await uploadToCloudinary(file.path);
      invoiceUrl.push(uploadResult);
    }
  }
  const newExpense = await prisma.expense.create({
    data: {
      submittedById: submittedById as string,
      countryId: countryId as string, // MUST BE INCLUDED
      // Value Fields
      amount: Number(amount), // Ensure amount is a number
      category: category, // Ensure category is a valid ExpenseCategory enum value
      status: 'pending',
      invoiceUrl: invoiceUrl, // Ensure this is an array of strings
      date: finalDate,
      notes: notes,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(true, 201, 'Expense created successfully', newExpense));
});

// Get all expenses with optional filters
const getAllExpensesController = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { projectId, submittedById, status } = req.query;

  let expenseStatus = undefined;
  if (
    status &&
    typeof status === 'string' &&
    ['pending', 'approved', 'rejected'].includes(status)
  ) {
    expenseStatus = status;
  }

  const expenses = await prisma.expense.findMany({
    where: {
      projectId: projectId ? String(projectId) : undefined,

      status: expenseStatus,
    },
    include: {
      submittedBy: {
        include: {
          country: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Fetched expenses successfully', expenses));
});

// Get single expense by ID
const getExpenseByIdController = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new ApiError(false, 404, 'Expense not found');
  }

  return res.status(200).json(new ApiResponse(true, 200, 'Fetched expense successfully', expense));
});

// Update an expense
const updateExpenseController = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { amount, category, projectId, status, invoiceUrl, date, notes, approvedById } = req.body;

  // Validate enum if provided
  if (status && !['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(false, 400, 'Invalid status value');
  }

  const updatedExpense = await prisma.expense.update({
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

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Expense updated successfully', updatedExpense));
});

// Update an expense
const updateStatusExpenseController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status, notes, approvedById } = req.body;

    // Validate enum if provided
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(false, 400, 'Invalid status value');
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        status: status,
         notes,
         approvedById,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(true, 200, 'Expense updated successfully', updatedExpense));
  }
);

// Delete an expense
const deleteExpenseController = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  const deletedExpense = await prisma.expense.delete({
    where: { id },
  });

  return res
    .status(200)
    .json(new ApiResponse(true, 200, 'Expense deleted successfully', deletedExpense));
});

export {
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
  updateStatusExpenseController,
};
