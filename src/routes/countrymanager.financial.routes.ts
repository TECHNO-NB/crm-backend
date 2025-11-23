import express from 'express';
import { getFinancialDashboardController } from '../controllers/countrymanager.financial.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only specific roles can access
router.get(
  '/dashboard/:countryId',
  jwtVerify,
  authorizeRoles('country_manager', 'finance'),
  getFinancialDashboardController
);

export default router;
