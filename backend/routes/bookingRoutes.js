const express = require("express");
const {
  handlePaymentWebhook,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  completeBooking,
  getBookedSlotsForVenueDay
} = require("../controllers/bookingControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), handlePaymentWebhook);
router.get("/users-bookings", protect, getUserBookings);
router.delete("/:id", protect, cancelBooking);
router.get("/all", protect, getAllBookings);
router.post("/:id/complete", protect, completeBooking);
router.get("/venue/:venueId/slots/:date", protect, getBookedSlotsForVenueDay);

module.exports = router;
