import express from 'express';
import {  getProjectFinancials } from '../controllers/financedashboard.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only specific roles can access
router.get(
  '/',
  jwtVerify,
  authorizeRoles('admin', 'chairman', 'financial_manager',"volunteer"),
  getProjectFinancials
);

export default router;
