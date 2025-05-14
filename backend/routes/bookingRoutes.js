const express = require("express");
const {
  createBookingWithPayment,
  handlePaymentWebhook,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  completeBooking,
  getBookedSlotsForVenueDay
} = require("../controllers/bookingControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-payment", protect, createBookingWithPayment);
router.post("/webhook", express.raw({ type: "application/json" }), handlePaymentWebhook);
router.get("/", protect, getUserBookings);
router.delete("/:id", protect, cancelBooking);
router.get("/all", protect, getAllBookings);
router.post("/:id/complete", protect, completeBooking);
router.get("/venue/:venueId/slots/:date", protect, getBookedSlotsForVenueDay);

module.exports = router;
