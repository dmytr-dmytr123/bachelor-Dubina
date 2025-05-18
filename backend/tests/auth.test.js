const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/userModel");

//mock enail sending
jest.mock("../utils/sendEmail", () => jest.fn(() => Promise.resolve()));
jest.setTimeout(20000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("POST /api/auth/register", () => {
  it("success registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      role: "user",
      preferences: {
        sports: ["football"],
        skillLevel: "beginner",
        timeOfDay: ["evening"],
        location: "Kyiv",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("email", "test@example.com");
    expect(res.body.user).toHaveProperty("isVerified", false);

    const userInDB = await User.findOne({ email: "test@example.com" });
    expect(userInDB).not.toBeNull();
  });

  it("cant create without preferences", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "missing@example.com",
      password: "123456",
      role: "user",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg.title).toMatch(/preferences required/i);
  });
});
