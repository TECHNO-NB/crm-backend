// routes/ticket.routes.ts
import { Router } from "express";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller";
import upload from "../middlewares/multerMiddleware";
import { authorizeRoles, jwtVerify } from "../middlewares/authMiddleware";

const router = Router();

router.use(jwtVerify);
router.get("/", getTickets);
router.post("/", upload.array("attachments", 10),authorizeRoles("admin","it"), createTicket);
router.put("/:id", upload.array("attachments", 10), updateTicket);
router.delete("/:id", deleteTicket);

export default router;
