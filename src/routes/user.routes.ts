import { Router } from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  getOneUser,
} from '../controllers/user.controller.js';
// import { jwtVerify, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getAllUsers);

// get only one user
router.get('/:id', getOneUser);

// Admin and HR can update users
router.put('/:id', updateUser);

// Admin can delete users
router.delete('/:id', deleteUser);

// Admin can change roles
router.patch('/:id/role', changeUserRole);

export default router;
