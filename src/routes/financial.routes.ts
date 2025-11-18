import express from 'express';
import { getFinancialDashboardController } from '../controllers/financial.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only specific roles can access
router.get(
  '/dashboard',
  jwtVerify,
  authorizeRoles('admin', 'chairman', 'financial_manager'),
  getFinancialDashboardController
);

export default router;
