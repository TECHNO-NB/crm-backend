import express from 'express';
import { getFinancialDashboardController } from '../controllers/financial.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(jwtVerify);

// Only specific roles can access
router.get(
  '/dashboard',
  authorizeRoles('admin', 'country_manager', 'finance'),
  getFinancialDashboardController
);

export default router;
