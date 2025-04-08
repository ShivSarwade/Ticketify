import Router from 'express';
import { returnTicket, purchaseTicket, getAllTickets, getScannedTickets, getMyTickets, getTicketsByEventId, scanTicket } from '../controllers/ticket.controller.js';
import { verifyJWT as verifyOrganizer } from '../middlewares/organizerAuth.middleware.js';
import { verifyJWT as verifyUser } from '../middlewares/userAuth.middleware.js';
import { upload } from '../middlewares/multer.middelware.js';
import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import mongoose from "mongoose";
import { Image } from "canvas";
import { BrowserQRCodeReader } from "@zxing/browser";
import sharp from "sharp";
import fs from "fs/promises";

const router = Router();

router.post("/purchase-ticket", verifyUser, purchaseTicket);
router.post("/return-ticket", verifyUser, returnTicket);

router.post("/get-all-tickets", getAllTickets);
router.post("/get-scanned-tickets", verifyOrganizer, getScannedTickets);
router.post("/get-my-tickets", verifyUser, getMyTickets);
router.post("/get-tickets-by-event-id", verifyOrganizer, getTicketsByEventId);
router.post("/scan-ticket", upload.single("ticket"), verifyOrganizer, scanTicket);

export default router;
