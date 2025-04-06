const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Venue = require("../models/venueModel");
const User = require("../models/userModel");

const createBookingWithPayment = async (req, res) => {
  try {
    const { venueId, slot, amount } = req.body;
    const userId = req.user._id;

    if (!venueId || !slot?.start || !slot?.end || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //test payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });

    //booking pending status
    const booking = await Booking.create({
      user: userId,
      venue: venueId,
      slot: {
        start: new Date(slot.start),
        end: new Date(slot.end),
      },
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
    });

    res.status(201).json({
      booking,
      clientSecret: paymentIntent.client_secret,
      msg: "Test Payment Intent created successfully",
    });
  } catch (error) {
    console.error("Error creating booking with test payment:", error);
    res.status(500).json({ message: "Failed to create test booking", error: error.message });
  }
};

//stripe webhook for payment status
const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });

      if (booking) {
        booking.status = "active";
        booking.paymentStatus = "succeeded";
        await booking.save();
        console.log("Payment succeeded, booking activated:", booking._id);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;

      const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });

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

    if (booking.paymentIntentId) {
      await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
      booking.paymentStatus = "canceled";
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ msg: "Booking and payment cancelled successfully." });
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

module.exports = {
  createBookingWithPayment,
  handlePaymentWebhook,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  completeBooking,
};
