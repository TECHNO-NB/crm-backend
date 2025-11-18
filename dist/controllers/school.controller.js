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
exports.deleteSchoolController = exports.updateSchoolController = exports.createSchoolController = exports.getSchoolByIdController = exports.getAllSchoolsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all schools
const getAllSchoolsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schools = yield db_1.default.school.findMany({
        include: { province: true, country: true },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, "Schools fetched successfully", schools));
}));
exports.getAllSchoolsController = getAllSchoolsController;
// Fetch single school
const getSchoolByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const school = yield db_1.default.school.findUnique({
        where: { id },
        include: { province: true, country: true },
    });
    if (!school)
        throw new apiError_1.default(false, 404, "School not found");
    res.status(200).json(new apiResponse_1.default(true, 200, "School fetched successfully", school));
}));
exports.getSchoolByIdController = getSchoolByIdController;
// Create school
const createSchoolController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, provinceId, address, studentCount, countryId, contactName, contactPhone, contactEmail, photos } = req.body;
    if (!name || !countryId)
        throw new apiError_1.default(false, 400, "Name and Country are required");
    const newSchool = yield db_1.default.school.create({
        data: {
            name,
            provinceId,
            address,
            studentCount,
            countryId,
            contactName,
            contactPhone,
            contactEmail,
            photos,
        },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, "School created successfully", newSchool));
}));
exports.createSchoolController = createSchoolController;
// Update school
const updateSchoolController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingSchool = yield db_1.default.school.findUnique({ where: { id } });
    if (!existingSchool)
        throw new apiError_1.default(false, 404, "School not found");
    const updatedSchool = yield db_1.default.school.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, "School updated successfully", updatedSchool));
}));
exports.updateSchoolController = updateSchoolController;
// Delete school
const deleteSchoolController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingSchool = yield db_1.default.school.findUnique({ where: { id } });
    if (!existingSchool)
        throw new apiError_1.default(false, 404, "School not found");
    yield db_1.default.school.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, "School deleted successfully"));
}));
exports.deleteSchoolController = deleteSchoolController;
