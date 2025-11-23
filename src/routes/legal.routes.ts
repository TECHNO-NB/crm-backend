import { Router } from 'express';
import { 
    addLegalCaseController, 
    fetchLegalCasesController, 
    getLegalCaseByIdController, 
    editLegalCaseController, 
    changeLegalCaseStatusController, 
    deleteLegalCaseController 
} from '../controllers/legal.controller.js'; // Adjust path
import { jwtVerify } from '../middlewares/authMiddleware.js';
import upload from "../middlewares/multerMiddleware.js"

const router = Router();

// Routes protected by general authentication
router.use(jwtVerify); 

// --- PUBLIC FETCH ---
// Fetch all cases (with filtering)
router.get('/', fetchLegalCasesController);
router.get('/:caseId', getLegalCaseByIdController);


// Routes protected by authorization (Admin/Legal team only)
router.use(jwtVerify); 

// --- ADD CASE ---
// Use Multer middleware 'upload.array' for multiple file uploads
router.post('/', 
    upload.array('documents', 5), // 'documents' is the field name, max 5 files
    addLegalCaseController
);

// --- EDIT / DELETE / STATUS CHANGE ---
router.route('/:caseId')
    .put(editLegalCaseController)           // Edit case details
    .delete(deleteLegalCaseController);     // Delete case

// Specific route for status change
router.patch('/:caseId/status', changeLegalCaseStatusController);


export default router;