const express = require("express");
const { createEvent, getAllEvents,joinEvent,getEventById,leaveEvent,deleteEvent,createEventWithBooking } = require("../controllers/eventControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getAllEvents);

router.post("/create", protect, createEvent);
router.post("/create-with-booking", protect, createEventWithBooking);
router.post("/:eventId/join", protect, joinEvent);
router.post("/:eventId/leave", protect, leaveEvent);
router.get("/:eventId", protect, getEventById);
router.delete("/:eventId", protect, deleteEvent);

module.exports = router;
