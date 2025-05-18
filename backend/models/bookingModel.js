const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
  slot: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "active", "cancelled", "completed"],
    default: "pending",
  },
  paymentIntentId: { type: String }, //stripe intent id
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded","canceled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
