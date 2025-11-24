"use strict";
// controllers/projectController.ts
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
exports.getRecentProjectsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const db_1 = __importDefault(require("../DB/db"));
exports.getRecentProjectsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // How many projects you want? Default = 4
    const limit = Number(req.query.limit) || 4;
    const projects = yield db_1.default.project.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            province: true,
            country: true
        }
    });
    // Format data as you showed
    const formatted = projects.map((p) => {
        var _a;
        return ({
            id: p.id,
            title: p.title,
            description: p.description,
            startAt: p.startDate,
            location: ((_a = p.country) === null || _a === void 0 ? void 0 : _a.countryName) ||
                "Not specified",
        });
    });
    res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted,
    });
}));
