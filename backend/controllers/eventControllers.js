const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Venue = require("../models/venueModel");

const Booking = require("../models/bookingModel");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createEventWithBooking = async (req, res) => {
  try {
    const {
      title,
      description,
      sportType,
      skillLevel,
      date,
      time,
      maxParticipants,
      venueId,
      slot,
      amount,
    } = req.body;
    const userId = req.user._id;

    if (
      !title || !sportType || !skillLevel || !date || !time ||
      !maxParticipants || !venueId || !slot || !amount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let booking;
    let paymentIntent;

    if (amount > 0) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          payment_method_types: ["card"],
        });
      } catch (error) {
        return res.status(500).json({ message: "Payment intent creation failed" });
      }

      booking = await Booking.create({
        user: userId,
        venue: venueId,
        slot: {
          start: new Date(slot.start),
          end: new Date(slot.end),
        },
        status: "pending",
        paymentIntentId: paymentIntent.id,
        paymentStatus: "pending",
      });
    } else {
      booking = await Booking.create({
        user: userId,
        venue: venueId,
        slot: {
          start: new Date(slot.start),
          end: new Date(slot.end),
        },
        status: "active",
        paymentStatus: "succeeded",
      });
    }

    const bookedSlot = {
      day: new Date(slot.start).toLocaleDateString('en-US', { weekday: 'short' }),
      slot: `${new Date(slot.start).toTimeString().slice(0, 5)}-${new Date(slot.end).toTimeString().slice(0, 5)}`,
    };

    await Venue.findByIdAndUpdate(venueId, {
      $push: { bookedSlots: bookedSlot },
      $pull: {
        "availability.$[elem].timeSlots": bookedSlot.slot
      }
    }, {
      arrayFilters: [
        { "elem.day": bookedSlot.day }
      ]
    });
    

    const event = await Event.create({
      title,
      description,
      sportType,
      skillLevel,
      date: new Date(date),
      time,
      maxParticipants,
      venue: venueId,
      booking: booking._id,
      organizer: userId,
      createdBy: userId,
    });

    res.status(201).json({
      msg: {
        title: "Event Created",
        desc: "Your event and booking were successfully created.",
      },
      data: { event, booking },
      clientSecret: paymentIntent ? paymentIntent.client_secret : null,
    });
  } catch (error) {
    console.error("Error creating event with booking:", error.message);
    res.status(500).json({ message: "Event creation failed", error: error.message });
  }
};


const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      sportType,
      skillLevel,
      date,
      time,
      venue,
      customLocation,
      maxParticipants,
    } = req.body;

    if (
      !title ||
      !sportType ||
      !skillLevel ||
      !date ||
      !time ||
      !maxParticipants
    ) {
      return res.status(400).json({
        msg: {
          title: "Missing required fields!",
          desc: "Please fill in all details.",
        },
      });
    }

    if ((!venue && !customLocation) || (venue && customLocation)) {
      return res.status(400).json({
        msg: {
          title: "Invalid Location",
          desc: "Please provide either a venue or a custom location.",
        },
      });
    }

    if (!req.user) {
      return res.status(401).json({
        msg: {
          title: "Unauthorized!",
          desc: "You must be logged in to create an event.",
        },
      });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        msg: {
          title: "Invalid Date!",
          desc: "Please provide a valid date.",
        },
      });
    }

    if (venue) {
      const selectedVenue = await Venue.findById(venue);

      if (!selectedVenue) {
        return res.status(404).json({
          msg: {
            title: "Venue Not Found",
            desc: "Selected venue does not exist.",
          },
        });
      }

      const existingEvent = await Event.findOne({
        venue,
        date: eventDate,
        time,
      });

      if (existingEvent) {
        return res.status(400).json({
          msg: {
            title: "Venue Unavailable",
            desc: "This venue is already booked for the selected date and time.",
          },
        });
      }

      if (!selectedVenue.sports.includes(sportType)) {
        return res.status(400).json({
          msg: {
            title: "Invalid Sport",
            desc: "This venue does not support the selected sport.",
          },
        });
      }

      const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      const availableTime = selectedVenue.availability.find(
        (slot) => slot.day === dayOfWeek
      );

      if (
        !availableTime ||
        time < availableTime.startTime ||
        time > availableTime.endTime
      ) {
        return res.status(400).json({
          msg: {
            title: "Venue Not Available",
            desc: "This venue is not available at the selected time.",
          },
        });
      }
    }

    const newEvent = new Event({
      title,
      description,
      sportType,
      skillLevel,
      date: eventDate,
      time,
      venue: venue || undefined,
      customLocation: customLocation || undefined,
      maxParticipants,
      createdBy: req.user._id,
    });

    await newEvent.save();

    res.status(201).json({
      msg: {
        title: "Event Created!",
        desc: "Your event has been successfully created.",
      },
      event: newEvent,
    });
  } catch (error) {
    console.error("Event creation failed:", error);
    res.status(500).json({
      msg: {
        title: "Server Error",
        desc: "Something went wrong. Try again later.",
      },
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;

    const events = await Event.find().populate("createdBy", "name email");

    const eventsWithStatus = events.map((event) => ({
      ...event.toObject(),
      userJoined: userId ? event.participants.includes(userId) : false,
      isFull: event.participants.length >= event.maxParticipants,
    }));

    res.status(200).json(eventsWithStatus);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({
      msg: { title: "Server Error", desc: "Could not retrieve events." },
    });
  }
};

const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        msg: { title: "Event Not Found", desc: "This event does not exist." },
      });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({
        msg: {
          title: "Already Joined",
          desc: "You are already participating in this event.",
        },
      });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        msg: {
          title: "Event Full",
          desc: "This event has reached maximum participants.",
        },
      });
    }

    //save user to event participants
    event.participants.push(userId);
    await event.save();

    //update attended events list
    const user = await User.findById(userId);
    user.attendedEvents.push(eventId);
    await user.save();

    res.status(200).json({
      msg: {
        title: "Joined Event",
        desc: "You have successfully joined the event.",
      },
      event,
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({
      msg: {
        title: "Server Error",
        desc: "Something went wrong. Try again later.",
      },
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("participants", "name email")
      .populate("organizer", "name email");

    if (!event) {
      return res.status(404).json({
        msg: { title: "Event Not Found", desc: "This event does not exist." },
      });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    res.status(500).json({
      msg: {
        title: "Server Error",
        desc: "Could not retrieve event details.",
      },
    });
  }
};

const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;
t
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        msg: { title: "Event Not Found", desc: "This event does not exist." },
      });
    }

    //check if user is in event
    if (!event.participants.includes(userId)) {
      return res.status(400).json({
        msg: {
          title: "Not Participating",
          desc: "You are not a participant in this event.",
        },
      });
    }

    //remove user
    event.participants = event.participants.filter(
      (id) => id.toString() !== userId.toString()
    );
    await event.save();

    //remove from attended events
    const user = await User.findById(userId);
    user.attendedEvents = user.attendedEvents.filter(
      (id) => id.toString() !== eventId.toString()
    );
    await user.save();

    res.status(200).json({
      msg: {
        title: "Left Event",
        desc: "You have successfully left the event.",
      },
      event,
    });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({
      msg: {
        title: "Server Error",
        desc: "Something went wrong. Try again later.",
      },
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        msg: { title: "Event Not Found", desc: "This event does not exist." },
      });
    }

    //check if loggined user is a creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        msg: {
          title: "Unauthorized",
          desc: "You are not allowed to delete this event.",
        },
      });
    }

    await event.deleteOne();

    res.status(200).json({
      msg: {
        title: "Event Deleted",
        desc: "The event has been removed successfully.",
      },
    });
  } catch (error) {
    console.error("Failed to delete event:", error);
    res.status(500).json({
      msg: { title: "Server Error", desc: "Could not delete event." },
    });
  }
};

module.exports = {
  createEventWithBooking,
  createEvent,
  getAllEvents,
  joinEvent,
  getEventById,
  leaveEvent,
  deleteEvent,
};
