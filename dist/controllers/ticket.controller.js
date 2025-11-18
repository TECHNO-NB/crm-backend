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
exports.deleteTicketController = exports.updateTicketController = exports.createTicketController = exports.getTicketByIdController = exports.getAllTicketsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all tickets
const getAllTicketsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tickets = yield db_1.default.ticket.findMany({ include: { requester: true, assignee: true }, orderBy: { createdAt: "desc" } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Tickets fetched successfully", tickets));
}));
exports.getAllTicketsController = getAllTicketsController;
// Fetch single ticket
const getTicketByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const ticket = yield db_1.default.ticket.findUnique({ where: { id }, include: { requester: true, assignee: true } });
    if (!ticket)
        throw new apiError_1.default(false, 404, "Ticket not found");
    res.status(200).json(new apiResponse_1.default(true, 200, "Ticket fetched successfully", ticket));
}));
exports.getTicketByIdController = getTicketByIdController;
// Create ticket
const createTicketController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, requesterId, assigneeId, priority, status, logs, attachments } = req.body;
    if (!title || !status)
        throw new apiError_1.default(false, 400, "Title and status are required");
    const ticket = yield db_1.default.ticket.create({ data: { title, description, requesterId, assigneeId, priority, status, logs, attachments } });
    res.status(201).json(new apiResponse_1.default(true, 201, "Ticket created successfully", ticket));
}));
exports.createTicketController = createTicketController;
// Update ticket
const updateTicketController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingTicket = yield db_1.default.ticket.findUnique({ where: { id } });
    if (!existingTicket)
        throw new apiError_1.default(false, 404, "Ticket not found");
    const updatedTicket = yield db_1.default.ticket.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, "Ticket updated successfully", updatedTicket));
}));
exports.updateTicketController = updateTicketController;
// Delete ticket
const deleteTicketController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingTicket = yield db_1.default.ticket.findUnique({ where: { id } });
    if (!existingTicket)
        throw new apiError_1.default(false, 404, "Ticket not found");
    yield db_1.default.ticket.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Ticket deleted successfully"));
}));
exports.deleteTicketController = deleteTicketController;
