import express from 'express';
// import {  getProjectFinancials } from '../controllers/financedashboard.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

import { getAllCountryFinanceDetails } from '../controllers/financedashboard.controller.js';

const router = express.Router();

// Only specific roles can access
router.get(
  '/',

  getAllCountryFinanceDetails
);

export default router;
