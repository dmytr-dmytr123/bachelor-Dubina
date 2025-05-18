const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Venue = require("../models/venueModel");
const User = require("../models/userModel");

//stripe webhook for payment status
const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const booking = await Booking.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (booking) {
        booking.status = "active";
        booking.paymentStatus = "succeeded";
        await booking.save();
        console.log("Payment succeeded, booking activated:", booking._id);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const booking = await Booking.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (booking) {
        booking.status = "cancelled";
        booking.paymentStatus = "failed";
        await booking.save();
        console.log("Payment failed, booking cancelled:", booking._id);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title date time")
      .populate("venue", "name location");

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ msg: "Failed to retrieve bookings." });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found." });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to cancel this booking." });
    }

    if (booking.paymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
        console.log("Stripe refund issued:", refund.id);
        booking.paymentStatus = "refunded";
      } catch (refundError) {
        console.error("Refund failed:", refundError.message);
        return res.status(500).json({ msg: "Failed to refund payment." });
      }
    }

    booking.status = "cancelled";
    const start = new Date(booking.slot.start);
    const end = new Date(booking.slot.end);

    const slotString = `${start.toTimeString().slice(0, 5)}-${end
      .toTimeString()
      .slice(0, 5)}`;
    const dayString = start.toLocaleDateString("en-US", { weekday: "short" });

    await Venue.findByIdAndUpdate(
      booking.venue,
      {
        $push: {
          "availability.$[elem].timeSlots": slotString,
        },
        $pull: {
          bookedSlots: {
            day: dayString,
            slot: slotString,
          },
        },
      },
      {
        arrayFilters: [{ "elem.day": dayString }],
      }
    );

    await booking.save();

    res
      .status(200)
      .json({ msg: "Booking and payment cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ msg: "Failed to cancel booking." });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("venue", "name location");

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error.message);
    res.status(500).json({ msg: "Failed to retrieve bookings." });
  }
};

const completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found." });
    }

    booking.status = "completed";
    booking.paymentStatus = "succeeded";
    await booking.save();

    res.status(200).json({ msg: "Booking marked as completed." });
  } catch (error) {
    console.error("Error marking booking as completed:", error.message);
    res.status(500).json({ msg: "Failed to mark booking as completed." });
  }
};

const getBookedSlotsForVenueDay = async (req, res) => {
  try {
    const { venueId, date } = req.params;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      venue: venueId,
      "slot.start": { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "active"] },
    });

    const slots = bookings.map((b) => {
      const start = new Date(b.slot.start).toTimeString().slice(0, 5);
      const end = new Date(b.slot.end).toTimeString().slice(0, 5);
      return `${start}-${end}`;
    });

    res.status(200).json({ bookedSlots: slots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Failed to fetch booked slots" });
  }
};

module.exports = {
  handlePaymentWebhook,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  completeBooking,
  getBookedSlotsForVenueDay,
};
