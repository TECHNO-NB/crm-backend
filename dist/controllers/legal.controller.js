"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLegalCaseController = exports.changeLegalCaseStatusController = exports.editLegalCaseController = exports.getLegalCaseByIdController = exports.fetchLegalCasesController = exports.addLegalCaseController = void 0;
const asyncHandler_js_1 = __importDefault(require("../utils/asyncHandler.js")); // Ensure the path is correct
const apiResponse_js_1 = __importDefault(require("../utils/apiResponse.js")); // Ensure the path is correct
const db_js_1 = __importDefault(require("../DB/db.js")); // Ensure the path is correct
const cloudinary_js_1 = require("../utils/cloudinary.js"); // Create this utility
const client_1 = require("@prisma/client");
// --- 1. ADD LegalCase (Including File Upload) ---
exports.addLegalCaseController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore - Assuming user is attached by 'protect' middleware
    const { id: submittedById, countryId: userCountryId } = req.user;
    // Data from request body
    const { title, description, category, priority, status, applicantId, respondentId, assignedToId, provinceId, filingDate, hearingDates, notes, } = req.body;
    // Ensure mandatory fields are present
    if (!title || !category) {
        return res
            .status(400)
            .json(new apiResponse_js_1.default(false, 400, 'Title and Category are required.', null));
    }
    let documents = [];
    // 📝 Handle File Upload (Multer & Cloudinary)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => (0, cloudinary_js_1.uploadToCloudinary)(file.path, 'legal-documents'));
        const uploadedDocuments = yield Promise.all(uploadPromises);
        // Collect the secure URLs from the upload response
        documents = uploadedDocuments.filter((url) => url).map((upload) => upload || upload);
    }
    // 🛠️ Prepare data for Prisma
    const newCase = yield db_js_1.default.legalCase.create({
        data: {
            title,
            description,
            category,
            priority: priority || client_1.LegalPriority.medium, // Default to medium
            status: status || client_1.LegalCaseStatus.open, // Default to open
            // User Relations
            applicantId: applicantId || submittedById, // Default applicant to the submitting user
            respondentId,
            assignedToId,
            // Location (countryId is mandatory, provinceId is optional)
            countryId: userCountryId, // Use the countryId from the submitting user
            provinceId,
            // Dates & Arrays
            filingDate: filingDate ? new Date(filingDate) : new Date(),
            hearingDates: Array.isArray(hearingDates) ? hearingDates.map((d) => new Date(d)) : [],
            notes: Array.isArray(notes) ? notes : notes ? [notes] : [],
            documents, // Array of uploaded Cloudinary URLs
        },
    });
    return res
        .status(201)
        .json(new apiResponse_js_1.default(true, 201, 'Legal Case created successfully.', newCase));
}));
// --- 2. FETCH LegalCases (List and Filter) ---
exports.fetchLegalCasesController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { id, role } = req.user;
    const { status, priority, category, countryId, provinceId, search, page = 1, limit = 10, } = req.query;
    //  @ts-ignore
    const skip = (parseInt(page) - 1) * parseInt(limit);
    //  @ts-ignore
    const take = parseInt(limit);
    // Define a base filter for the query
    const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (status && { status: status })), (priority && { priority: priority })), (category && { category: category })), (countryId && { countryId: countryId })), (provinceId && { provinceId: provinceId })), (search && {
        OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { caseNumber: { contains: search, mode: 'insensitive' } },
        ],
    })), (role === 'legal' && { assignedToId: id }));
    const [cases, total] = yield db_js_1.default.$transaction([
        db_js_1.default.legalCase.findMany({
            //  @ts-ignore
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                applicant: { select: { fullName: true } },
                assignedTo: { select: { fullName: true, role: true } },
                country: { select: { countryName: true } },
            },
        }),
        //  @ts-ignore
        db_js_1.default.legalCase.count({ where }),
    ]);
    return res.status(200).json(new apiResponse_js_1.default(true, 200, 'Legal Cases fetched successfully.', {
        cases,
        //  @ts-ignore
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalCases: total,
    }));
}));
// --- 3. FETCH Single LegalCase ---
exports.getLegalCaseByIdController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseId } = req.params;
    const legalCase = yield db_js_1.default.legalCase.findUnique({
        where: { id: caseId },
        include: {
            applicant: { select: { fullName: true, email: true } },
            respondent: { select: { fullName: true, email: true } },
            assignedTo: { select: { fullName: true, role: true, phone: true } },
            country: { select: { countryName: true } },
            province: { select: { name: true } },
        },
    });
    if (!legalCase) {
        return res.status(404).json(new apiResponse_js_1.default(false, 404, 'Legal Case not found.', null));
    }
    return res.status(200).json(new apiResponse_js_1.default(true, 200, 'Legal Case details fetched.', legalCase));
}));
// --- 4. EDIT LegalCase Details (excluding status/files) ---
exports.editLegalCaseController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseId } = req.params;
    const updateData = req.body;
    // Optional: Filter out non-updatable fields like ID, createdAt, updatedAt
    delete updateData.id;
    delete updateData.createdAt;
    // Format dates if they are being updated
    if (updateData.filingDate) {
        updateData.filingDate = new Date(updateData.filingDate);
    }
    if (updateData.closedDate) {
        updateData.closedDate = new Date(updateData.closedDate);
    }
    if (updateData.hearingDates && Array.isArray(updateData.hearingDates)) {
        updateData.hearingDates = updateData.hearingDates.map((d) => new Date(d));
    }
    const updatedCase = yield db_js_1.default.legalCase.update({
        where: { id: caseId },
        data: updateData,
    });
    return res
        .status(200)
        .json(new apiResponse_js_1.default(true, 200, 'Legal Case updated successfully.', updatedCase));
}));
// --- 5. CHANGE LegalCase Status ---
exports.changeLegalCaseStatusController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseId } = req.params;
    const { newStatus } = req.body;
    // Input validation: Check if newStatus is a valid enum value
    if (!Object.values(client_1.LegalCaseStatus).includes(newStatus)) {
        return res
            .status(400)
            .json(new apiResponse_js_1.default(false, 400, `Invalid status value. Must be one of: ${Object.values(client_1.LegalCaseStatus).join(', ')}.`, null));
    }
    const updatedCase = yield db_js_1.default.legalCase.update({
        where: { id: caseId },
        data: { status: newStatus },
        select: { id: true, caseNumber: true, title: true, status: true },
    });
    return res
        .status(200)
        .json(new apiResponse_js_1.default(true, 200, `Status changed to ${newStatus}.`, updatedCase));
}));
// --- 6. DELETE LegalCase ---
exports.deleteLegalCaseController = (0, asyncHandler_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseId } = req.params;
    // Optional: Before deleting, you might want to delete files from Cloudinary too.
    // For simplicity, we skip Cloudinary deletion here.
    yield db_js_1.default.legalCase.delete({
        where: { id: caseId },
    });
    return res.status(204).json(new apiResponse_js_1.default(true, 204, 'Legal Case deleted successfully.', null));
}));
