const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

const User = require("../models/userModel");
const Venue = require("../models/venueModel");
const Event = require("../models/eventModel");
const Booking = require("../models/bookingModel");

//mock Stripe
jest.mock("stripe", () => {
  return () => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: "mock_payment_intent_id",
        client_secret: "mock_client_secret"
      }),
    },
  });
});

jest.setTimeout(30000);

let mongoServer;
let userToken;
let venueId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const venueOwner = await User.create({
    name: "Owner",
    email: "owner@example.com",
    password: "123456",
    isVerified: true,
    role: "venue_owner"
  });

  const user = await User.create({
    name: "User",
    email: "user@example.com",
    password: "123456",
    isVerified: true,
    role: "user",
    preferences: {
      sports: ["Football"],
      skillLevel: "beginner",
      timeOfDay: ["morning"],
      location: "Kyiv"
    }
  });

  userToken = require("../utils/generateToken")(user._id);

  const venue = await Venue.create({
    name: "Test Arena",
    description: "For football games",
    location: {
      address: "123 Street",
      city: "Kyiv"
    },
    sports: ["Football"],
    availability: [
      { day: "Fri", startTime: "08:00", endTime: "12:00" }
    ],
    pricingPerHour: 50,
    owner: venueOwner._id,
    images: []
  });

  venueId = venue._id;

  console.log("\nvenue created:");
  console.log(await Venue.findById(venueId).lean());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Event.deleteMany();
  await Booking.deleteMany();
});

test("user creates event with booking", async () => {
  const start = new Date();
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 година

  const res = await request(app)
    .post("/api/events/create-with-booking")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      title: "Test Football Match",
      description: "Morning friendly game",
      sportType: "Football",
      skillLevel: "beginner",
      date: start.toISOString(),
      time: "10:00",
      maxParticipants: 10,
      venueId: venueId.toString(),
      slot: {
        start,
        end
      },
      amount: 50
    });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("data.event");
  expect(res.body).toHaveProperty("data.booking");
  expect(res.body.data.event.title).toBe("Test Football Match");
  expect(res.body.data.booking.status).toBe("pending");

  console.log("\nbooking done:");
  console.log(res.body.data.booking);

  console.log("\nevent created:");
  console.log(res.body.data.event);

  console.log("\npayment:");
  console.log("clientSecret:", res.body.clientSecret);
});
