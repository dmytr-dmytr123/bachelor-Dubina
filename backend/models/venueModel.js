const mongoose = require("mongoose");

const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  let current = new Date(start);
  while (current < end) {
    const next = new Date(current);
    next.setHours(current.getHours() + 1);
    const slot = `${current.toTimeString().slice(0, 5)}-${next
      .toTimeString()
      .slice(0, 5)}`;
    slots.push(slot);
    current = next;
  }
  return slots;
};

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  sports: [{ type: String, required: true }],
  availability: [
    {
      day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      startTime: { type: String },
      endTime: { type: String },
      timeSlots: [{ type: String }] 
    },
  ],
  bookedSlots: [
    {
      day: { type: String },
      slot: { type: String },
    },
  ],
  pricingPerHour: { type: Number, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

//middleware to generate timeslots before saving
venueSchema.pre("save", function (next) {
  if (this.availability && Array.isArray(this.availability)) {
    this.availability = this.availability.map((slot) => {
      if (slot.startTime && slot.endTime) {
        const timeSlots = generateTimeSlots(slot.startTime, slot.endTime);
        return { ...slot, timeSlots };
      }
      return slot;
    });
  }
  next();
});

module.exports = mongoose.model("Venue", venueSchema);
