import express from 'express';
import {
  createCountryController,
  getAllCountriesController,
  getCountryByIdController,
  updateCountryController,
  deleteCountryController,
} from '../controllers/country.controller.js';
import { authorizeRoles, jwtVerify } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v1/country
 * @desc    Create a new country
 * @access  Private (Admin)
 */
router.post('/countys', jwtVerify, createCountryController);

router.get('/', getAllCountriesController);

/**
 * @route   GET /api/v1/country/:id
 * @desc    Get a country by ID
 * @access  Public
 */
router.get('/:id', getCountryByIdController);

/**
 * @route   PUT /api/v1/country/:id
 * @desc    Update country
 * @access  Private (Admin)
 */
router.put('/:id', jwtVerify, updateCountryController);

/**
 * @route   DELETE /api/v1/country/:id
 * @desc    Delete country
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  jwtVerify,
  authorizeRoles('admin,chairperson,chairperosn'),
  deleteCountryController
);

export default router;
