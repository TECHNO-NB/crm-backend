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
exports.updateStatusProjectController = exports.addUserToProjectController = exports.deleteProjectController = exports.updateProjectController = exports.getProjectByIdController = exports.getAllProjectsController = exports.createProjectController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const cloudinary_1 = require("../utils/cloudinary");
// Create Project
const createProjectController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, provinceId, managerId, status, startDate, endDate, budget, countryId, workers, } = req.body;
    if (!title || !status || !countryId) {
        throw new apiError_1.default(false, 400, 'Title, status, and countryId are required');
    }
    let documentUrls = [];
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            const uploadResult = yield (0, cloudinary_1.uploadToCloudinary)(file.path);
            documentUrls.push(uploadResult);
        }
    }
    let workersToConnect = undefined;
    if (workers) {
        const workerArray = typeof workers === 'string' ? JSON.parse(workers) : workers;
        if (Array.isArray(workerArray) && workerArray.length > 0) {
            workersToConnect = workerArray.map((id) => ({ id }));
        }
    }
    const project = yield db_1.default.project.create({
        data: Object.assign({ title,
            description,
            provinceId,
            managerId,
            status, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, budget: budget ? Number(budget) : undefined, countryId, documents: documentUrls }, (workersToConnect && {
            workers: {
                connect: workersToConnect,
            },
        })),
        include: {
            workers: true,
            manager: true,
            province: true,
        },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, 'Project created successfully', project));
}));
exports.createProjectController = createProjectController;
// ==========================================================
// Get All Projects
// ==========================================================
const getAllProjectsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   userid
    // @ts-ignore
    const { id } = req.user;
    const { countryId } = req.params;
    const approved = 'approved';
    const projects = yield db_1.default.project.findMany({
        where: {
            // @ts-ignore
            approved: approved,
            countryId: countryId,
        },
        include: {
            manager: true,
            province: true,
            country: true,
            workers: true, // Include assigned users
        },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Projects fetched successfully', projects));
}));
exports.getAllProjectsController = getAllProjectsController;
// ==========================================================
// Get Project By ID
// ==========================================================
const getProjectByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const project = yield db_1.default.project.findUnique({
        where: { id },
        include: {
            manager: true,
            province: true,
            country: true,
            donations: true,
            expenses: true,
            workers: true, // Include assigned users
        },
    });
    if (!project)
        throw new apiError_1.default(false, 404, 'Project not found');
    res.status(200).json(new apiResponse_1.default(true, 200, 'Project fetched successfully', project));
}));
exports.getProjectByIdController = getProjectByIdController;
// ==========================================================
// Update Project
// ==========================================================
const updateProjectController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, provinceId, managerId, status, startDate, endDate, budget, spent } = req.body;
    const project = yield db_1.default.project.update({
        where: { id },
        data: {
            title,
            description,
            provinceId,
            managerId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            budget: budget ? Number(budget) : undefined,
            spent: spent ? Number(spent) : undefined,
        },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Project updated successfully', project));
}));
exports.updateProjectController = updateProjectController;
// ==========================================================
// Update Project Status Or review Project
// ==========================================================
const updateStatusProjectController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { approved } = req.body;
    const project = yield db_1.default.project.update({
        where: { id },
        data: {
            approved,
        },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Project updated successfully', project));
}));
exports.updateStatusProjectController = updateStatusProjectController;
// ==========================================================
// Delete Project
// ==========================================================
const deleteProjectController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield db_1.default.project.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Project deleted successfully', null));
}));
exports.deleteProjectController = deleteProjectController;
// ==========================================================
// Add User to Project (Admin or Country Manager Only)
// ==========================================================
const addUserToProjectController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId, userId } = req.body;
    const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role; // assuming you attach user info in middleware
    if (!projectId || !userId) {
        throw new apiError_1.default(false, 400, 'projectId and userId are required');
    }
    // Only admin or country_manager can assign users
    if (userRole !== 'admin' && userRole !== 'country_manager') {
        throw new apiError_1.default(false, 403, 'Access denied: only admin or country manager can assign users to a project');
    }
    // Check project existence
    const project = yield db_1.default.project.findUnique({
        where: { id: projectId },
        include: { workers: true },
    });
    if (!project)
        throw new apiError_1.default(false, 404, 'Project not found');
    // Check user existence
    const user = yield db_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new apiError_1.default(false, 404, 'User not found');
    // Check if already assigned
    const alreadyAssigned = project.workers.some((worker) => worker.id === userId);
    if (alreadyAssigned) {
        throw new apiError_1.default(false, 400, 'User is already assigned to this project');
    }
    // Add user to project workers
    const updatedProject = yield db_1.default.project.update({
        where: { id: projectId },
        data: {
            workers: {
                connect: { id: userId },
            },
        },
        include: { workers: true },
    });
    res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'User added to project successfully', updatedProject));
}));
exports.addUserToProjectController = addUserToProjectController;
