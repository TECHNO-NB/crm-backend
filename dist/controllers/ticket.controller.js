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
exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTickets = void 0;
const db_1 = __importDefault(require("../DB/db"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const cloudinary_1 = require("../utils/cloudinary");
// 📌 1. Get all tickets
exports.getTickets = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tickets = yield db_1.default.ticket.findMany({
        include: {
            requester: true,
            assignee: true,
        },
        orderBy: { createdAt: "desc" },
    });
    res.json(new apiResponse_1.default(true, 200, "Tickets fetched successfully", tickets));
}));
// 📌 2. Create ticket
exports.createTicket = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, requesterId, assigneeId, priority } = req.body;
    let uploadedFiles = [];
    // Upload attachments if any
    if (req.files) {
        const files = req.files;
        for (const file of files) {
            const upload = yield (0, cloudinary_1.uploadToCloudinary)(file.path);
            uploadedFiles.push(upload);
        }
    }
    const ticket = yield db_1.default.ticket.create({
        data: {
            title,
            description,
            requesterId,
            assigneeId,
            priority,
            status: "open",
            attachments: uploadedFiles,
            logs: [{ message: "Ticket created", at: new Date() }],
        },
    });
    res.json(new apiResponse_1.default(true, 201, "Ticket created successfully", ticket));
}));
// 📌 3. Update ticket
exports.updateTicket = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, requesterId, assigneeId, priority, status } = req.body;
    const ticketId = req.params.id;
    // Find existing ticket
    const ticket = yield db_1.default.ticket.findUnique({
        where: { id: ticketId },
    });
    if (!ticket)
        return res
            .status(404)
            .json(new apiResponse_1.default(false, 404, "Ticket not found"));
    let newFiles = ticket.attachments;
    // If new attachments are uploaded
    if (req.files) {
        const files = req.files;
        for (const file of files) {
            const uploaded = yield (0, cloudinary_1.uploadToCloudinary)(file.path);
            newFiles.push(uploaded);
        }
    }
    const updated = yield db_1.default.ticket.update({
        where: { id: ticketId },
        data: {
            title,
            description,
            requesterId,
            assigneeId,
            priority,
            status,
            attachments: newFiles,
            logs: [
                { message: "Ticket updated", at: new Date() },
            ],
        },
    });
    res.json(new apiResponse_1.default(true, 200, "Ticket updated successfully", updated));
}));
// 📌 4. Delete ticket
exports.deleteTicket = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = req.params.id;
    const ticket = yield db_1.default.ticket.findUnique({
        where: { id: ticketId },
    });
    if (!ticket)
        return res
            .status(404)
            .json(new apiResponse_1.default(false, 404, "Ticket not found"));
    // Delete attachments from Cloudinary
    for (const file of ticket.attachments) {
        yield (0, cloudinary_1.deleteCloudinaryImage)(file);
    }
    yield db_1.default.ticket.delete({
        where: { id: ticketId },
    });
    res.json(new apiResponse_1.default(true, 200, "Ticket deleted successfully"));
}));
