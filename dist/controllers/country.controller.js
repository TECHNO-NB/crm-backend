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
exports.deleteCountryController = exports.updateCountryController = exports.getCountryByIdController = exports.getAllCountriesController = exports.createCountryController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const db_1 = __importDefault(require("../DB/db"));
// ✅ Create Country
exports.createCountryController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryName, code } = req.body;
    if (!countryName || !code) {
        throw new apiError_1.default(false, 400, 'Country name and code are required');
    }
    const existing = yield db_1.default.country.findFirst({
        where: {
            OR: [{ countryName }, { code }],
        },
    });
    if (existing) {
        throw new apiError_1.default(false, 409, 'Country already exists with same name or code');
    }
    const country = yield db_1.default.country.create({
        data: {
            countryName,
            code,
        },
    });
    return res
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'Country created successfully', country));
}));
// ✅ Get All Countries
exports.getAllCountriesController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("HIT SERVER");
    const countries = yield db_1.default.country.findMany({
        include: {
            provinces: true,
            schools: true,
            projects: true,
            users: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'All countries fetched successfully', countries));
}));
// ✅ Get Single Country by ID
exports.getCountryByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new apiError_1.default(false, 400, 'Country ID is required');
    }
    const country = yield db_1.default.country.findUnique({
        where: { id },
        include: {
            provinces: true,
            schools: true,
            projects: true,
            users: true,
        },
    });
    if (!country) {
        throw new apiError_1.default(false, 404, 'Country not found');
    }
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Country fetched successfully', country));
}));
// ✅ Update Country
exports.updateCountryController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { countryName, code } = req.body;
    if (!id) {
        throw new apiError_1.default(false, 400, 'Country ID is required');
    }
    const existing = yield db_1.default.country.findUnique({ where: { id } });
    if (!existing) {
        throw new apiError_1.default(false, 404, 'Country not found');
    }
    const updatedCountry = yield db_1.default.country.update({
        where: { id },
        data: {
            countryName: countryName !== null && countryName !== void 0 ? countryName : existing.countryName,
            code: code !== null && code !== void 0 ? code : existing.code,
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Country updated successfully', updatedCountry));
}));
// ✅ Delete Country
exports.deleteCountryController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new apiError_1.default(false, 400, 'Country ID is required');
    }
    const existing = yield db_1.default.country.findUnique({ where: { id } });
    if (!existing) {
        throw new apiError_1.default(false, 404, 'Country not found');
    }
    yield db_1.default.country.delete({ where: { id } });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'Country deleted successfully'));
}));
