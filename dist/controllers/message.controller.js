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
exports.getOnlyPrivateUnreadMessageCountController = exports.getAllUnreadMessageCountController = exports.deleteMessageController = exports.updateMessageController = exports.createMessageController = exports.getMessageByIdController = exports.getAllMessagesController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all messages
const getAllMessagesController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield db_1.default.message.findMany({
        include: { fromUser: true, toUser: true },
        orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Messages fetched successfully', messages));
}));
exports.getAllMessagesController = getAllMessagesController;
// Fetch single message
const getMessageByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const message = yield db_1.default.message.findUnique({
        where: { id },
        include: { fromUser: true, toUser: true },
    });
    if (!message)
        throw new apiError_1.default(false, 404, 'Message not found');
    res.status(200).json(new apiResponse_1.default(true, 200, 'Message fetched successfully', message));
}));
exports.getMessageByIdController = getMessageByIdController;
// Create message
const createMessageController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fromUserId, toUserId, groupId, subject, body, channel, meta, attachments } = req.body;
    if (!body || !channel)
        throw new apiError_1.default(false, 400, 'Body and channel are required');
    const message = yield db_1.default.message.create({
        data: { fromUserId, toUserId, groupId, subject, body, channel, meta, attachments },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, 'Message created successfully', message));
}));
exports.createMessageController = createMessageController;
// Update message
const updateMessageController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingMessage = yield db_1.default.message.findUnique({ where: { id } });
    if (!existingMessage)
        throw new apiError_1.default(false, 404, 'Message not found');
    const updatedMessage = yield db_1.default.message.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Message updated successfully', updatedMessage));
}));
exports.updateMessageController = updateMessageController;
// Delete message
const deleteMessageController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingMessage = yield db_1.default.message.findUnique({ where: { id } });
    if (!existingMessage)
        throw new apiError_1.default(false, 404, 'Message not found');
    yield db_1.default.message.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, 'Message deleted successfully'));
}));
exports.deleteMessageController = deleteMessageController;
// get all unread message count
const getAllUnreadMessageCountController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //  @ts-ignore
    const { id } = req.user;
    if (!id) {
        throw new apiError_1.default(false, 404, 'User must login');
    }
    const getMessages = yield db_1.default.message.count({
        where: {
            toUserId: id,
            isRead: false,
        },
    });
    res
        .status(200)
        .json(new apiResponse_1.default(false, 200, 'Successfully get message notification', getMessages));
}));
exports.getAllUnreadMessageCountController = getAllUnreadMessageCountController;
// get only private unread message count
const getOnlyPrivateUnreadMessageCountController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //  @ts-ignore
    const { id } = req.user;
    if (!id) {
        throw new apiError_1.default(false, 404, 'User must login');
    }
    const getMessages = yield db_1.default.message.findMany({
        where: {
            toUserId: id,
            isRead: false,
        },
    });
    res
        .status(200)
        .json(new apiResponse_1.default(false, 200, 'Successfully get message notification', getMessages));
}));
exports.getOnlyPrivateUnreadMessageCountController = getOnlyPrivateUnreadMessageCountController;
