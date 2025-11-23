// routes/ticket.routes.ts
import { Router } from "express";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller";
import upload from "../middlewares/multerMiddleware";

const router = Router();

router.get("/", getTickets);
router.post("/", upload.array("attachments", 10), createTicket);
router.put("/:id", upload.array("attachments", 10), updateTicket);
router.delete("/:id", deleteTicket);

export default router;
