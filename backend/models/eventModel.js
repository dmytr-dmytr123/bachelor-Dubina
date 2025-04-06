const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sportType: {
    type: String,
    required: true,
    enum: [
      "Football",
      "Tennis",
      "Basketball",
      "Running",
      "Swimming",
      "Cycling",
    ],
  },
  skillLevel: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"],
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  maxParticipants: { type: Number, required: true, min: 1 },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // Linking the booking
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Participants list
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
  },
});

module.exports = mongoose.model("Event", eventSchema);
