import express from 'express';
// import {  getProjectFinancials } from '../controllers/financedashboard.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

import { getAllCountryFinanceDetails } from '../controllers/financedashboard.controller.js';

const router = express.Router();

router.use(jwtVerify);

// Only specific roles can access
router.get('/', authorizeRoles('admin'), getAllCountryFinanceDetails);

export default router;
