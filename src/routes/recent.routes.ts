import express from 'express';
import { getRecentProjectsController } from '../controllers/recent.controller';

const router = express.Router();

router.get('/', getRecentProjectsController);

export default router;
