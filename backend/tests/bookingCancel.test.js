const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

const Booking = require("../models/bookingModel");
const Venue = require("../models/venueModel");
const User = require("../models/userModel");

jest.mock("stripe", () => {
  return () => ({
    refunds: {
      create: jest.fn().mockResolvedValue({ id: "mock_refund_id" }),
    },
  });
});

let mongoServer;
let token, venueId, bookingId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const user = await User.create({
    name: "User",
    email: "user@example.com",
    password: "123456",
    isVerified: true,
    role: "user",
  });

  token = require("../utils/generateToken")(user._id);

  const venue = await Venue.create({
    name: "Cancel Test Venue",
    description: "Test",
    location: { address: "City", city: "Kyiv", coordinates: { lat: 0, lng: 0 } },
    sports: ["Football"],
    pricingPerHour: 50,
    availability: [{ day: "Mon", startTime: "08:00", endTime: "10:00", timeSlots: [] }],
    bookedSlots: [
      { day: "Mon", slot: "09:00-10:00" }
    ],
    owner: user._id,
  });

  venueId = venue._id;

  const start = new Date();
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const booking = await Booking.create({
    user: user._id,
    venue: venue._id,
    slot: { start, end },
    status: "pending",
    paymentIntentId: "test_intent_123",
    paymentStatus: "pending",
  });

  bookingId = booking._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("Cancel booking and issue refund", async () => {
  const res = await request(app)
    .delete(`/api/bookings/cancel/${bookingId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.msg).toMatch(/cancelled/i);

  const updatedBooking = await Booking.findById(bookingId);
  expect(updatedBooking.status).toBe("cancelled");
  expect(updatedBooking.paymentStatus).toBe("refunded");

  const updatedVenue = await Venue.findById(venueId);
  expect(updatedVenue.bookedSlots.length).toBe(0); 
});
