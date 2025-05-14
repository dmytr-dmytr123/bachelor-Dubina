const express = require("express");
const {
  createEvent,
  createEventWithBooking,
  getAllEvents,
  joinEvent,
  getEventById,
  leaveEvent,
  deleteEvent,
  getRecommendations,
  getUserRecommendations,
  inviteUserToEvent,
  acceptInvite,
  getUserInvitations,
  getMyCreatedEvents,
  getMyJoinedEvents

} = require("../controllers/eventControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/recommended-users", protect, getUserRecommendations);

router.get("/recs", protect, getRecommendations);
router.post("/:eventId/invite", protect, inviteUserToEvent);
router.post("/:eventId/accept", protect, acceptInvite);
router.get("/my/invitations", protect, getUserInvitations);
router.get("/my/created", protect, getMyCreatedEvents);
router.get("/my/joined", protect, getMyJoinedEvents);

router.post("/", protect, createEvent);
router.post("/create-with-booking", protect, createEventWithBooking);
router.get("/", protect, getAllEvents);
router.post("/:eventId/join", protect, joinEvent);
router.post("/:eventId/leave", protect, leaveEvent);
router.delete("/:eventId", protect, deleteEvent);
router.get("/:eventId", protect, getEventById);
router.post("/:eventId/invite", protect, inviteUserToEvent);

module.exports = router;
