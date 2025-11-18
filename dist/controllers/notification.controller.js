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
exports.deleteNotificationController = exports.updateNotificationController = exports.createNotificationController = exports.getNotificationByIdController = exports.getAllNotificationsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all notifications
const getAllNotificationsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield db_1.default.notification.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, "Notifications fetched successfully", notifications));
}));
exports.getAllNotificationsController = getAllNotificationsController;
// Fetch single notification
const getNotificationByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const notification = yield db_1.default.notification.findUnique({
        where: { id },
        include: { user: true },
    });
    if (!notification)
        throw new apiError_1.default(false, 404, "Notification not found");
    res.status(200).json(new apiResponse_1.default(true, 200, "Notification fetched successfully", notification));
}));
exports.getNotificationByIdController = getNotificationByIdController;
// Create notification
const createNotificationController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, channel, title, body, meta } = req.body;
    if (!channel || !title || !body)
        throw new apiError_1.default(false, 400, "Channel, title, and body are required");
    const notification = yield db_1.default.notification.create({
        data: { userId, channel, title, body, meta },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, "Notification created successfully", notification));
}));
exports.createNotificationController = createNotificationController;
// Update notification
const updateNotificationController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingNotification = yield db_1.default.notification.findUnique({ where: { id } });
    if (!existingNotification)
        throw new apiError_1.default(false, 404, "Notification not found");
    const updatedNotification = yield db_1.default.notification.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, "Notification updated successfully", updatedNotification));
}));
exports.updateNotificationController = updateNotificationController;
// Delete notification
const deleteNotificationController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingNotification = yield db_1.default.notification.findUnique({ where: { id } });
    if (!existingNotification)
        throw new apiError_1.default(false, 404, "Notification not found");
    yield db_1.default.notification.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Notification deleted successfully"));
}));
exports.deleteNotificationController = deleteNotificationController;
