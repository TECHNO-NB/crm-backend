"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/ticket.routes.ts
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.jwtVerify);
router.get("/", ticket_controller_1.getTickets);
router.post("/", multerMiddleware_1.default.array("attachments", 10), (0, authMiddleware_1.authorizeRoles)("admin", "it"), ticket_controller_1.createTicket);
router.put("/:id", multerMiddleware_1.default.array("attachments", 10), ticket_controller_1.updateTicket);
router.delete("/:id", ticket_controller_1.deleteTicket);
exports.default = router;
