const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Venue = require("../models/venueModel");

const Booking = require("../models/bookingModel");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  runRecommenderPythonScript,
} = require("../python_bridge/recommenderBridge");

const inviteUserToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userIdToInvite } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    //if already joined
    if (event.participants.includes(userIdToInvite)) {
      return res.status(400).json({ message: "User already joined the event" });
    }

    //if already invited
    if (event.invitedUsers.includes(userIdToInvite)) {
      return res.status(400).json({ message: "User already invited" });
    }

    event.invitedUsers.push(userIdToInvite);
    await event.save();

    res
      .status(200)
      .json({ message: "User has been invited. Waiting for confirmation." });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ message: "Failed to invite user" });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    //if not invited
    if (!event.invitedUsers.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not invited to this event" });
    }

    //if already there
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    //out of invites to participants
    event.invitedUsers = event.invitedUsers.filter(
      (id) => id.toString() !== userId.toString()
    );
    event.participants.push(userId);
    await event.save();

    const user = await User.findById(userId);
    user.attendedEvents.push(event._id);
    await user.save();

    res
      .status(200)
      .json({ message: "You have successfully joined the event." });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ message: "Failed to accept invitation" });
  }
};

const getUserInvitations = async (req, res) => {
  try {
    const invitations = await Event.find({ invitedUsers: req.user._id })
      .populate("createdBy", "name email")
      .populate("venue", "location");

    res.status(200).json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: "Failed to load invitations" });
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    console.log("getUserRecommendations called");

    const userId = req.user._id;
    const user = await User.findById(userId);
    const userProfile = {
      _id: user._id.toString(),
      email: user.email,
      sports: user.preferences?.sports || [],
      skillLevel: user.preferences?.skillLevel || "beginner",
      timeOfDay: user.preferences?.timeOfDay || [],
      location: user.preferences?.location,
    };
    console.log("MY USER", userProfile);
    const allUsers = await User.find({ _id: { $ne: user._id } });
    console.log("ALL USERS", allUsers);
    const simplifiedUsers = allUsers.map((user) => ({
      _id: user._id,
      email: user.email,
      sports: user.preferences?.sports || [],
      skillLevel: user.preferences?.skillLevel || "beginner",
      timeOfDay: user.preferences?.timeOfDay || [],
      location: user.preferences?.location,
    }));

    const { recommended_users } = await runRecommenderPythonScript(
      userProfile,
      simplifiedUsers,
      [],
      [],
      "users"
    );
    res.status(200).json({ recommended_users });
    console.log("ABCD", recommended_users);
  } catch (error) {
    console.error("User recommendation error:", error);
    res.status(500).json({ message: "User recommendation failed" });
  }
};

/*const getRecommendations = async (req, res) => {
  try {
    console.log("getRecommendations called");
    console.log("req.user:", req.user);

    const userId = req.user ? req.user._id : null;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const events = await Event.find().populate("venue");

    const userProfile = {
      sports: user.preferences?.sports || [],
      skillLevel: user.preferences?.skillLevel || "beginner",
      timeOfDay: user.preferences?.timeOfDay || [],
      location: user.preferences?.location,
    };

    console.log("userProfile:", userProfile);

    const simplifiedEvents = events.map((e) => ({
      _id: e._id,
      title: e.title || "Unknown",
      sportType: e.sportType || "Unknown",
      skillLevel: e.skillLevel || "Unknown",
      date: e.date?.toISOString() || null,
      time: e.time || "Unknown",
      location: e.venue?.location?.city || "Unknown",
    }));
    
  
    

    console.log("simplifiedEvents:", simplifiedEvents);

    const attendedEventDocs = await Event.find({
      _id: { $in: user.attendedEvents },
    }).populate("venue");

    const attendedEvents = attendedEventDocs.map((e) => ({
      _id: e._id,
      title: e.title || "Unknown",
      sportType: e.sportType || "Unknown",
      skillLevel: e.skillLevel || "Unknown",
      time: e.timeOfDay || e.time || "Unknown",
      location: e.venue?.location?.city || "Unknown",
    }));
    console.log("ATTENDED ", attendedEvents);
    const { recommendations } = await runRecommenderPythonScript(
      userProfile,
      simplifiedEvents,
      "events",
      attendedEvents
    );
    
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Recommendation failed" });
  }
};*/
const getRecommendations = async (req, res) => {
  try {
    console.log("getRecommendations called");
    const userId = req.user ? req.user._id : null;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const events = await Event.find().populate("venue");
    const userProfile = {
      sports: user.preferences?.sports || [],
      skillLevel: user.preferences?.skillLevel || "beginner",
      timeOfDay: user.preferences?.timeOfDay || [],
      location: user.preferences?.location || "unknown",
      gender: user.preferences?.gender || "unknown",
      age: user.preferences?.age ?? 18,
    };

    const simplifiedEvents = events.map((e) => ({
      _id: e._id,
      title: e.title || "Unknown",
      sportType: e.sportType || "Unknown",
      skillLevel: e.skillLevel || "Unknown",
      date: e.date?.toISOString() || null,
      time: e.time || "Unknown",
      location: e.venue?.location?.city || "Unknown",
    }));

    const attendedEventDocs = await Event.find({
      _id: { $in: user.attendedEvents },
    }).populate("venue");
    const attendedEvents = attendedEventDocs.map((e) => ({
      sportType: e.sportType,
      skillLevel: e.skillLevel,
      time: e.timeOfDay || e.time,
      location: e.venue?.location?.city || "unknown",
      description: e.title || "unknown",
      date: e.date?.toISOString().split("T")[0] || null,
    }));

    const friendsAttended = user.friendsAttended || [];

    const result = await runRecommenderPythonScript(
      userProfile,
      simplifiedEvents,
      attendedEvents,
      friendsAttended,
      "events"
    );

    console.log("PYTHON RECOMMENDER RESULT:", result);

    if (!result || !Array.isArray(result.recommendations)) {
      console.error("invalid recommendations returned from python script");
      return res.status(500).json({ message: "recommendation engine failed" });
    }

    const enriched = result.recommendations
      .map((rec) => {
        const full = events.find((e) => e._id.toString() === rec.event_id);
        if (!full) return null;

        return {
          _id: full._id,
          title: full.title,
          sportType: full.sportType,
          skillLevel: full.skillLevel,
          date: full.date,
          time: full.time,
          location: full.venue?.location?.city,
          score: rec.score,
        };
      })
      .filter(Boolean);

    res.status(200).json({ recommendations: enriched });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Recommendation failed" });
  }
};

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
    } = req.body;
    const userId = req.user._id;

    if (
      !title ||
      !sportType ||
      !skillLevel ||
      !date ||
      !time ||
      !maxParticipants ||
      !venueId ||
      !slot?.start ||
      !slot?.end
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const venue = await Venue.findById(venueId).populate("owner");
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const startTime = new Date(slot.start);
    const endTime = new Date(slot.end);
    const durationHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const amount = venue.pricingPerHour * durationHours;

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
        return res
          .status(500)
          .json({ message: "Payment intent creation failed" });
      }

      booking = await Booking.create({
        user: userId,
        venue: venueId,
        slot: { start: startTime, end: endTime },
        status: "pending",
        paymentIntentId: paymentIntent.id,
        paymentStatus: "pending",
      });
    } else {
      booking = await Booking.create({
        user: userId,
        venue: venueId,
        slot: { start: startTime, end: endTime },
        status: "active",
        paymentStatus: "succeeded",
      });
    }

    //upd venue
    const bookedSlot = {
      day: startTime.toLocaleDateString("en-US", { weekday: "short" }),
      slot: `${startTime.toTimeString().slice(0, 5)}-${endTime
        .toTimeString()
        .slice(0, 5)}`,
    };

    await Venue.findByIdAndUpdate(
      venueId,
      {
        $push: { bookedSlots: bookedSlot },
        $pull: {
          "availability.$[elem].timeSlots": bookedSlot.slot,
        },
      },
      {
        arrayFilters: [{ "elem.day": bookedSlot.day }],
      }
    );

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

    //balance changes
    if (amount > 0) {
      try {
        const user = await User.findById(userId);
        const venueOwner = venue.owner;

        if (!user || !venueOwner) {
          console.warn(
            "User or Venue owner not found, skipping balance transfer"
          );
        } else {
          if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
          }

          user.balance -= amount;
          venueOwner.balance += amount;

          await user.save();
          await venueOwner.save();
        }
      } catch (err) {
        console.error("Balance transfer failed:", err.message);
      }
    }

    res.status(201).json({
      msg: {
        title: "Event Created",
        desc: "Your event and booking were successfully created.",
      },
      data: { event, booking, amount },
      clientSecret: paymentIntent ? paymentIntent.client_secret : null,
    });
  } catch (error) {
    console.error("Error creating event with booking:", error.message);
    res
      .status(500)
      .json({ message: "Event creation failed", error: error.message });
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
    console.log(userId);

    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("venue", "name location");

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
      .populate("organizer", "name email")
      .populate("venue", "name location");

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

const getMyCreatedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ createdBy: userId }).populate(
      "venue",
      "name location"
    );
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching user's created events:", error);
    res.status(500).json({ message: "Failed to retrieve your created events" });
  }
};

const getMyJoinedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ participants: userId }).populate(
      "venue",
      "name location"
    );
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching joined events:", error);
    res.status(500).json({ message: "Failed to retrieve your joined events" });
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
  getRecommendations,
  getUserRecommendations,
  inviteUserToEvent,
  acceptInvite,
  getUserInvitations,
  getMyCreatedEvents,
  getMyJoinedEvents,
};
