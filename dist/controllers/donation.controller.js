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
exports.deleteDonation = exports.updateDonation = exports.createDonation = exports.getDonationById = exports.getAllDonations = void 0;
const db_1 = __importDefault(require("../DB/db"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all donations with optional filters
const getAllDonations = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, status, donorEmail } = req.query;
    const donations = yield db_1.default.donation.findMany({
        where: {
            projectId: projectId ? String(projectId) : undefined,
            // @ts-ignore
            status: status ? String(status) : undefined,
            donorEmail: donorEmail ? String(donorEmail) : undefined,
        },
        orderBy: { createdAt: "desc" },
    });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, "Fetched all donations successfully", donations));
}));
exports.getAllDonations = getAllDonations;
// Fetch single donation by ID
const getDonationById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const donation = yield db_1.default.donation.findUnique({ where: { id } });
    if (!donation)
        throw new apiError_1.default(false, 404, "Donation not found");
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, "Fetched donation successfully", donation));
}));
exports.getDonationById = getDonationById;
// Create a new donation
const createDonation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { donorName, donorEmail, donorPhone, amount, method, status, receivedAt, projectId, receiptUrl, note, invoiceNo, } = req.body;
    if (!donorName || !amount || !method || !status) {
        throw new apiError_1.default(false, 400, "Please provide required fields");
    }
    const donation = yield db_1.default.donation.create({
        data: {
            donorName,
            donorEmail,
            donorPhone,
            amount: Number(amount),
            method,
            status,
            receivedAt: receivedAt ? new Date(receivedAt) : undefined,
            projectId,
            receiptUrl,
            note,
            invoiceNo,
        },
    });
    return res
        .status(201)
        .json(new apiResponse_1.default(true, 201, "Donation created successfully", donation));
}));
exports.createDonation = createDonation;
// Update donation
const updateDonation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { donorName, donorEmail, donorPhone, amount, method, status, receivedAt, projectId, receiptUrl, note, invoiceNo, } = req.body;
    const donation = yield db_1.default.donation.findUnique({ where: { id } });
    if (!donation)
        throw new apiError_1.default(false, 404, "Donation not found");
    const updatedDonation = yield db_1.default.donation.update({
        where: { id },
        data: {
            donorName: donorName !== null && donorName !== void 0 ? donorName : donation.donorName,
            donorEmail: donorEmail !== null && donorEmail !== void 0 ? donorEmail : donation.donorEmail,
            donorPhone: donorPhone !== null && donorPhone !== void 0 ? donorPhone : donation.donorPhone,
            amount: amount !== undefined ? Number(amount) : donation.amount,
            method: method !== null && method !== void 0 ? method : donation.method,
            status: status !== null && status !== void 0 ? status : donation.status,
            receivedAt: receivedAt ? new Date(receivedAt) : donation.receivedAt,
            projectId: projectId !== null && projectId !== void 0 ? projectId : donation.projectId,
            receiptUrl: receiptUrl !== null && receiptUrl !== void 0 ? receiptUrl : donation.receiptUrl,
            note: note !== null && note !== void 0 ? note : donation.note,
            invoiceNo: invoiceNo !== null && invoiceNo !== void 0 ? invoiceNo : donation.invoiceNo,
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, "Donation updated successfully", updatedDonation));
}));
exports.updateDonation = updateDonation;
// Delete donation
const deleteDonation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const donation = yield db_1.default.donation.findUnique({ where: { id } });
    if (!donation)
        throw new apiError_1.default(false, 404, "Donation not found");
    yield db_1.default.donation.delete({ where: { id } });
    return res
        .status(200)
        .json(new apiResponse_1.default(true, 200, "Donation deleted successfully", null));
}));
exports.deleteDonation = deleteDonation;
