import express from 'express';
import {
  registerUserControllers,
  loginUserControllers,
  verifyUserControllers,
  logoutUserControllers,
} from '../controllers/auth.controller';
import { jwtVerify } from '../middlewares/authMiddleware';
import upload from '../middlewares/multerMiddleware'; 

const router = express.Router();

router.post('/register', upload.single('avatar'), registerUserControllers);

router.post('/login', loginUserControllers);

router.get('/verify', jwtVerify, verifyUserControllers);

router.post('/logout', logoutUserControllers);

export default router;
