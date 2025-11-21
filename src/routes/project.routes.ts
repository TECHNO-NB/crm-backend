import { Router } from 'express';
import {
  createProjectController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multerMiddleware';

const router = Router();

// All routes require authentication
router.use(jwtVerify);

// Public route: fetch all projects
router.get('/', getAllProjectsController);
router.get('/:id', getProjectByIdController);

// Restricted routes: Admin and Country Manager
router.post(
  '/',
  upload.array('documents', 10),
  authorizeRoles('admin', 'finance', 'chairmain', 'country_chairman'),
  createProjectController
);

router.put('/:id', authorizeRoles('admin', 'country_manager'), updateProjectController);
router.delete('/:id', authorizeRoles('admin'), deleteProjectController);

export default router;
