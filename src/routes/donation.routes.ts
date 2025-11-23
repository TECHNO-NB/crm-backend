import { Router } from 'express';
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from '../controllers/donation.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multerMiddleware.js';

const router = Router();

// Any authenticated user can view donations
router.get('/', jwtVerify, getAllDonations);
router.get('/:id', jwtVerify, getDonationById);

// Only admin or finance role can create/update/delete
router.post(
  '/',
  upload.single('receiptUrl'),
  jwtVerify,
  authorizeRoles('admin', 'finance',"country_manager"),
  createDonation
);
router.put('/:id', jwtVerify, authorizeRoles('admin', 'finance'), updateDonation);
router.delete('/:id', jwtVerify, authorizeRoles('admin', 'finance'), deleteDonation);

export default router;
