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
exports.getDashboardReportController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const db_1 = __importDefault(require("../DB/db"));
exports.getDashboardReportController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // --- 1. Total Users by Role ---
    // @ts-ignore
    const user = req.user;
    const usersByRole = yield db_1.default.user.groupBy({
        by: ['role'],
        _count: { _all: true },
    });
    // --- 2. Total Projects + by Status ---
    const projectsByStatus = yield db_1.default.project.groupBy({
        by: ['status'],
        _count: { _all: true },
    });
    const totalProjects = projectsByStatus.reduce((acc, p) => acc + p._count._all, 0);
    // --- 3. Total Donations ---
    const totalDonationStats = yield db_1.default.donation.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
    });
    // --- 4. Expenses summary ---
    const expenseByStatus = yield db_1.default.expense.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { _all: true },
    });
    // --- 5. Active Volunteers count ---
    const activeVolunteers = yield db_1.default.user.count({
        where: { role: 'volunteer', isActive: true },
    });
    // --- 6. Country + Province count ---
    const [totalCountries, totalProvinces] = yield Promise.all([
        db_1.default.country.count(),
        db_1.default.province.count(),
    ]);
    // Group donations by country
    const topCountries = yield db_1.default.donation.groupBy({
        by: ['countryId'],
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
    });
    // Enrich with country names
    const topCountryDonations = yield Promise.all(topCountries.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const country = yield db_1.default.country.findUnique({
            where: { id: item.countryId },
            select: { countryName: true },
        });
        return {
            country: (_a = country === null || country === void 0 ? void 0 : country.countryName) !== null && _a !== void 0 ? _a : 'Unknown',
            totalDonation: (_b = item._sum.amount) !== null && _b !== void 0 ? _b : 0,
            donationCount: (_c = item._count._all) !== null && _c !== void 0 ? _c : 0,
        };
    })));
    // --- 8. Total Messages (optional) ---
    const totalMessages = yield db_1.default.message.count();
    const notificationForYou = yield db_1.default.notification.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    // --- Final Response ---
    return res.status(200).json(new apiResponse_1.default(true, 200, 'Successfully fetched dashboard data', {
        usersByRole,
        totalProjects,
        projectsByStatus,
        totalDonation: totalDonationStats._sum.amount || 0,
        totalDonationsCount: totalDonationStats._count._all,
        expenseByStatus,
        activeVolunteers,
        totalCountries,
        totalProvinces,
        totalMessages,
        topCountryDonations: topCountryDonations.filter(Boolean),
        notificationForYou,
    }));
}));
