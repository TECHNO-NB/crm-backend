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
exports.logoutUserControllers = exports.verifyUserControllers = exports.loginUserControllers = exports.registerUserControllers = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const generateJwtTokens_1 = __importDefault(require("../helpers/generateJwtTokens"));
const cookieOption_1 = require("../helpers/cookieOption");
const cloudinary_1 = require("../utils/cloudinary");
const hash_1 = require("../utils/hash");
// user register
const registerUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, fullName, password, phone, countryId, address } = req.body;
    const avatar = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!avatar) {
        throw new apiError_1.default(false, 400, 'Avatar is required');
    }
    if (!email || !fullName || !password || !address || !phone || !countryId) {
        throw new apiError_1.default(false, 400, 'Please fill the all required field');
    }
    const alreadyRegisterUser = yield db_1.default.user.findUnique({ where: { email: email } });
    if (alreadyRegisterUser) {
        throw new apiError_1.default(false, 409, 'User already register with this email');
    }
    const hashedPassword = yield (0, hash_1.hashPassword)(password);
    if (!hashedPassword) {
        throw new apiError_1.default(false, 500, 'Password hash failed');
    }
    const cloudinaryUrl = yield (0, cloudinary_1.uploadToCloudinary)(avatar);
    if (!cloudinaryUrl) {
        throw new apiError_1.default(false, 500, 'Avatar upload failed');
    }
    const userData = {
        phone: phone,
        email: email,
        fullName: fullName,
        avatarUrl: cloudinaryUrl,
        countryId: countryId,
        password: hashedPassword,
        address: address,
    };
    const createUser = yield db_1.default.user.create({
        data: userData,
    });
    if (!createUser) {
        throw new apiError_1.default(false, 500, 'User register failed');
    }
    return res.status(201).json(new apiResponse_1.default(true, 201, 'User register successfully', createUser));
}));
exports.registerUserControllers = registerUserControllers;
// login user
const loginUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.default(false, 400, 'Please fill the all required field');
    }
    const user = yield db_1.default.user.findUnique({
        where: { email: email },
        select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
            country: true,
            fullName: true,
            role: true,
            password: true,
        },
    });
    if (!user || !user.password) {
        throw new apiError_1.default(false, 404, 'User not found');
    }
    const isPasswordMatch = yield (0, hash_1.comparePassword)(password, user.password);
    if (!isPasswordMatch) {
        throw new apiError_1.default(false, 400, 'Invalid password');
    }
    const dataOfUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
    };
    const generateJwtToken = yield (0, generateJwtTokens_1.default)(dataOfUser);
    if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
        throw new apiError_1.default(false, 500, 'Jwt Token Generate failed');
    }
    return res
        .cookie('accessToken', generateJwtToken.accessToken, cookieOption_1.cookieOptions)
        .cookie('refreshToken', generateJwtToken.refreshToken, cookieOption_1.cookieOptions)
        .status(200)
        .json(new apiResponse_1.default(true, 200, 'User login successfully', user));
}));
exports.loginUserControllers = loginUserControllers;
// verify user
const verifyUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    if (!user.id) {
        throw new apiError_1.default(false, 401, 'Id is required');
    }
    const dataOfUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
        email: user === null || user === void 0 ? void 0 : user.email,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const getUser = yield db_1.default.user.findUnique({
        where: {
            id: user === null || user === void 0 ? void 0 : user.id,
        },
        select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
            country: true,
            fullName: true,
            role: true,
        },
    });
    const generateJwtToken = yield (0, generateJwtTokens_1.default)(dataOfUser);
    if (!generateJwtToken.accessToken || !generateJwtToken.refreshToken) {
        throw new apiError_1.default(false, 500, 'Jwt Token Generate failed');
    }
    return res
        .cookie('accessToken', generateJwtToken.accessToken, cookieOption_1.cookieOptions)
        .cookie('refreshToken', generateJwtToken.refreshToken, cookieOption_1.cookieOptions)
        .status(201)
        .json(new apiResponse_1.default(true, 201, 'User verify successfully', getUser));
}));
exports.verifyUserControllers = verifyUserControllers;
// logout user
const logoutUserControllers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .clearCookie('accessToken', cookieOption_1.cookieOptions)
        .clearCookie('refreshToken', cookieOption_1.cookieOptions)
        .json(new apiResponse_1.default(true, 200, 'User logout successfully'));
}));
exports.logoutUserControllers = logoutUserControllers;
