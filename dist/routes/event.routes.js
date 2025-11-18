"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public / Authenticated routes
router.get("/", event_controller_1.getAllEventsController);
router.get("/:id", authMiddleware_1.jwtVerify, event_controller_1.getEventByIdController);
// Admin / Manager routes
router.post("/", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "country_manager"), event_controller_1.createEventController);
router.put("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "country_manager"), event_controller_1.updateEventController);
router.delete("/:id", authMiddleware_1.jwtVerify, (0, authMiddleware_1.authorizeRoles)("admin", "country_manager"), event_controller_1.deleteEventController);
exports.default = router;
