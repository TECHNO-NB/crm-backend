import { Router } from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  getOneUser,
} from '../controllers/user.controller.js';
import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(jwtVerify);

router.get('/', getAllUsers);

// get only one user
router.get('/:id', getOneUser);

// Admin and HR can update users
router.put('/:id', authorizeRoles('admin', 'country_manager', 'hr'), updateUser);

// Admin can delete users
router.delete('/:id', authorizeRoles('admin', 'country_manager', 'hr'), deleteUser);

// Admin can change roles
router.patch('/:id/role', authorizeRoles('admin', 'country_manager', 'hr'), changeUserRole);

export default router;
