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
exports.deleteEventController = exports.updateEventController = exports.createEventController = exports.getEventByIdController = exports.getAllEventsController = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const db_1 = __importDefault(require("../DB/db"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Fetch all events
const getAllEventsController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield db_1.default.event.findMany({
        include: { organizer: true },
        orderBy: { startAt: "desc" },
    });
    res.status(200).json(new apiResponse_1.default(true, 200, "Events fetched successfully", events));
}));
exports.getAllEventsController = getAllEventsController;
// Fetch single event
const getEventByIdController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const event = yield db_1.default.event.findUnique({
        where: { id },
        include: { organizer: true },
    });
    if (!event)
        throw new apiError_1.default(false, 404, "Event not found");
    res.status(200).json(new apiResponse_1.default(true, 200, "Event fetched successfully", event));
}));
exports.getEventByIdController = getEventByIdController;
// Create event
const createEventController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, startAt, endAt, organizerId, attendees, location, attachments } = req.body;
    if (!title || !startAt)
        throw new apiError_1.default(false, 400, "Title and startAt are required");
    const event = yield db_1.default.event.create({
        data: { title, description, startAt: new Date(startAt), endAt: endAt ? new Date(endAt) : null, organizerId, attendees, location, attachments },
    });
    res.status(201).json(new apiResponse_1.default(true, 201, "Event created successfully", event));
}));
exports.createEventController = createEventController;
// Update event
const updateEventController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    const existingEvent = yield db_1.default.event.findUnique({ where: { id } });
    if (!existingEvent)
        throw new apiError_1.default(false, 404, "Event not found");
    const updatedEvent = yield db_1.default.event.update({ where: { id }, data });
    res.status(200).json(new apiResponse_1.default(true, 200, "Event updated successfully", updatedEvent));
}));
exports.updateEventController = updateEventController;
// Delete event
const deleteEventController = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existingEvent = yield db_1.default.event.findUnique({ where: { id } });
    if (!existingEvent)
        throw new apiError_1.default(false, 404, "Event not found");
    yield db_1.default.event.delete({ where: { id } });
    res.status(200).json(new apiResponse_1.default(true, 200, "Event deleted successfully"));
}));
exports.deleteEventController = deleteEventController;
