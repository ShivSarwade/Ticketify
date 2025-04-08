import { Router } from "express";
import { getEventById, deleteEvent, getAllEvents, createOrUpdateEvent, getSecuredEventsByOrganiserId,getEventsByOrganiserId, searchEventsByNameOrLocation, getEventByLocation, getAllFutureEvents } from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/organizerAuth.middleware.js";
import {upload} from '../middlewares/multer.middelware.js'

const router = Router();

//Only verified organizers can access these routes
router.post("/create-or-update-event", upload.single("poster"),verifyJWT, createOrUpdateEvent);

router.post("/delete-event", verifyJWT, deleteEvent);

// Anyone can access these routes
router.get("/get-event-by-id", getEventById);
router.get("/all-events", getAllEvents);
router.post("/get-secured-events-by-organiser-id",verifyJWT,getSecuredEventsByOrganiserId)
router.get("/get-events-by-organiser-id",verifyJWT,getEventsByOrganiserId)
router.post("/get-events-by-location",getEventByLocation)
router.post("/search-events-by-name-or-location",searchEventsByNameOrLocation)
router.post("/get-all-future-events",getAllFutureEvents)
export default router