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
exports.authorizeRoles = exports.jwtVerify = void 0;
const apiError_1 = __importDefault(require("../utils/apiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../DB/db"));
// General JWT verification middleware
const jwtVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken || !refreshToken) {
        throw new apiError_1.default(false, 401, "Access token and refresh token are required");
    }
    const decodedAccess = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    if (!(decodedAccess === null || decodedAccess === void 0 ? void 0 : decodedAccess.id))
        throw new apiError_1.default(false, 401, "Invalid access token");
    const user = yield db_1.default.user.findUnique({ where: { id: decodedAccess.id } });
    if (!user || user.refreshToken !== refreshToken) {
        throw new apiError_1.default(false, 401, "Invalid refresh token");
    }
    const decodedRefresh = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    if (!decodedRefresh)
        throw new apiError_1.default(false, 401, "Invalid refresh token");
    // @ts-ignore
    req.user = user;
    next();
}));
exports.jwtVerify = jwtVerify;
// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    if (!user)
        throw new apiError_1.default(false, 401, "User not authenticated");
    if (!allowedRoles.includes(user.role)) {
        throw new apiError_1.default(false, 403, `Forbidden: Only ${allowedRoles.join(", ")} can access`);
    }
    next();
}));
exports.authorizeRoles = authorizeRoles;
