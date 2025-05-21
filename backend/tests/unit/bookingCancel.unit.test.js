
const { cancelBooking } = require("../controllers/bookingController");
const Booking = require("../models/bookingModel");
const Venue = require("../models/venueModel");

jest.mock("../models/bookingModel");
jest.mock("../models/venueModel");

const mockReq = (overrides) => ({
  params: { id: "booking123" },
  user: { _id: "user123" },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("cancelBooking (unit)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if booking not found", async () => {
    Booking.findById.mockResolvedValue(null);

    const req = mockReq();
    const res = mockRes();

    await cancelBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: "Booking not found." });
  });

  it("should return 403 if user not authorized", async () => {
    Booking.findById.mockResolvedValue({
      user: "anotherUser",
    });

    const req = mockReq();
    const res = mockRes();

    await cancelBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      msg: "You are not authorized to cancel this booking.",
    });
  });

  it("should cancel booking and update venue", async () => {
    const mockSave = jest.fn();
    Booking.findById.mockResolvedValue({
      _id: "booking123",
      user: "user123",
      venue: "venue123",
      slot: {
        start: new Date("2025-05-21T10:00:00Z"),
        end: new Date("2025-05-21T11:00:00Z"),
      },
      status: "pending",
      paymentStatus: "pending",
      save: mockSave,
    });

    Venue.findByIdAndUpdate.mockResolvedValue({});

    const req = mockReq();
    const res = mockRes();

    await cancelBooking(req, res);

    expect(Venue.findByIdAndUpdate).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Booking and payment cancelled successfully.",
    });
  });
});
