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
exports.getOneUser = exports.changeUserRole = exports.deleteUser = exports.updateUser = exports.getAllUsersFromManagerCountry = void 0;
const db_1 = __importDefault(require("../DB/db"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const cloudinary_1 = require("../utils/cloudinary");
// Fetch all users
const getAllUsersFromManagerCountry = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { country } = req.params;
    if (!country) {
        throw new apiError_1.default(false, 400, 'Country parameter is required');
    }
    const users = yield db_1.default.$queryRawUnsafe(`
      SELECT 
        u.id, u."fullName", u.email, u.phone, u.role,
        u."countryId", c."countryName" AS "countryName",
        u."provinceId", u."avatarUrl", u.address,
        u."isActive", u."createdAt", u."updatedAt",
        MAX(m."createdAt") AS "latestMessageDate"
      FROM "User" u
      LEFT JOIN "Country" c
        ON c.id = u."countryId"
      LEFT JOIN "Message" m
        ON m."toUserId" = u.id
      WHERE u."countryId" = $1
      GROUP BY u.id, c.id
      ORDER BY "latestMessageDate" DESC NULLS LAST;
    `, country);
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Fetched users successfully', users));
}));
exports.getAllUsersFromManagerCountry = getAllUsersFromManagerCountry;
// Update user info
const updateUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { fullName, phone, address, countryId, provinceId } = req.body;
    const avatar = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const user = yield db_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new apiError_1.default(false, 404, 'User not found');
    let avatarUrl = user.avatarUrl;
    if (avatar) {
        const uploadedUrl = yield (0, cloudinary_1.uploadToCloudinary)(avatar);
        if (!uploadedUrl)
            throw new apiError_1.default(false, 500, 'Avatar upload failed');
        avatarUrl = uploadedUrl;
    }
    const updatedUser = yield db_1.default.user.update({
        where: { id },
        data: {
            fullName: fullName !== null && fullName !== void 0 ? fullName : user.fullName,
            phone: phone !== null && phone !== void 0 ? phone : user.phone,
            address: address !== null && address !== void 0 ? address : user.address,
            countryId: countryId !== null && countryId !== void 0 ? countryId : user.countryId,
            provinceId: provinceId !== null && provinceId !== void 0 ? provinceId : user.provinceId,
            avatarUrl,
        },
    });
    return res.status(200).json(new apiResponse_1.default(true, 200, 'User updated successfully', updatedUser));
}));
exports.updateUser = updateUser;
// Delete user
const deleteUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield db_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new apiError_1.default(false, 404, 'User not found');
    yield db_1.default.user.delete({ where: { id } });
    return res.status(200).json(new apiResponse_1.default(true, 200, 'User deleted successfully', null));
}));
exports.deleteUser = deleteUser;
// Change user role
const changeUserRole = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role } = req.body;
    // Validate role
    const validRoles = [
        'chairman',
        'country_manager',
        'finance',
        'legal',
        'hr',
        'admin',
        'it',
        'councilor',
        'volunteer',
        'viewer',
    ];
    if (!role || !validRoles.includes(role)) {
        throw new apiError_1.default(false, 400, 'Invalid role provided');
    }
    const user = yield db_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new apiError_1.default(false, 404, 'User not found');
    const updatedUser = yield db_1.default.user.update({
        where: { id },
        data: { role },
    });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'User role updated successfully', updatedUser));
}));
exports.changeUserRole = changeUserRole;
// get only one user by id
const getOneUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new apiError_1.default(false, 401, 'user must login');
    }
    const user = yield db_1.default.user.findUnique({
        where: { id },
        select: {
            fullName: true,
            email: true,
            id: true,
            avatarUrl: true,
            country: true,
            role: true,
        },
    });
    return res.status(200).json(new apiResponse_1.default(true, 200, 'User get successfully', user));
}));
exports.getOneUser = getOneUser;
