const Venue = require("../models/venueModel");
const User = require("../models/userModel");

const createVenue = async (req, res) => {
  try {
    if (req.user.role !== "venue_owner") {
      return res.status(403).json({
        msg: {
          title: "Access Denied",
          desc: "Only venue owners can create venues.",
        },
      });
    }

    const {
      name,
      description,
      location,
      sports,
      availability,
      pricingPerHour,
      images,
    } = req.body;

    if (
      !name ||
      !location?.address ||
      !location?.city ||
      !sports.length ||
      !pricingPerHour ||
      !availability.length
    ) {
      return res.status(400).json({
        msg: {
          title: "Missing Data",
          desc: "Please provide all required fields.",
        },
      });
    }

    //validate availability structure
    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({
        msg: {
          title: "Invalid Availability",
          desc: "Please provide valid availability data.",
        },
      });
    }

    const newVenue = new Venue({
      name,
      description,
      location,
      sports,
      availability,
      pricingPerHour,
      images,
      owner: req.user._id,
    });

    await newVenue.save();

    res.status(201).json({
      msg: {
        title: "Venue Created",
        desc: "Your venue was successfully created.",
      },
      venue: newVenue,
    });
  } catch (error) {
    console.error("Create venue error:", error);
    res.status(500).json({
      msg: { title: "Server Error", desc: "Could not create venue." },
    });
  }
};

module.exports = {
  createVenue,
};

const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().populate("owner", "name email");
    res.status(200).json(venues);
  } catch (error) {
    console.error("Fetch venues error:", error);
    res
      .status(500)
      .json({
        msg: { title: "Server Error", desc: "Could not fetch venues." },
      });
  }
};

const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId).populate(
      "owner",
      "name email"
    );

    if (!venue) {
      return res
        .status(404)
        .json({ msg: { title: "Not Found", desc: "Venue does not exist." } });
    }

    res.status(200).json(venue);
  } catch (error) {
    console.error("Fetch venue error:", error);
    res
      .status(500)
      .json({ msg: { title: "Server Error", desc: "Could not fetch venue." } });
  }
};

const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);

    if (!venue) {
      return res
        .status(404)
        .json({ msg: { title: "Not Found", desc: "Venue does not exist." } });
    }

    if (venue.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          msg: {
            title: "Access Denied",
            desc: "You are not the owner of this venue.",
          },
        });
    }

    Object.assign(venue, req.body); //merge updated fields
    await venue.save();

    res.status(200).json({
      msg: { title: "Venue Updated", desc: "Your changes have been saved." },
      venue,
    });
  } catch (error) {
    console.error("Update venue error:", error);
    res
      .status(500)
      .json({
        msg: { title: "Server Error", desc: "Could not update venue." },
      });
  }
};

const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);

    if (!venue) {
      return res
        .status(404)
        .json({ msg: { title: "Not Found", desc: "Venue does not exist." } });
    }

    if (venue.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          msg: {
            title: "Access Denied",
            desc: "You are not the owner of this venue.",
          },
        });
    }

    await venue.deleteOne();

    res.status(200).json({
      msg: {
        title: "Venue Deleted",
        desc: "The venue was successfully removed.",
      },
    });
  } catch (error) {
    console.error("Delete venue error:", error);
    res
      .status(500)
      .json({
        msg: { title: "Server Error", desc: "Could not delete venue." },
      });
  }
};

const getMyVenues = async (req, res) => {
  try {
    if (req.user.role !== "venue_owner") {
      return res.status(403).json({
        msg: {
          title: "Access Denied",
          desc: "Only venue owners can access this route.",
        },
      });
    }

    const venues = await Venue.find({ owner: req.user._id });

    res.status(200).json(venues);
  } catch (error) {
    console.error("Get my venues error:", error);
    res.status(500).json({
      msg: { title: "Server Error", desc: "Could not retrieve your venues." },
    });
  }
};

const getVenueAvailability = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const availableSlots = venue.availability.map((daySlot) => {
      const bookedTimes = venue.bookedSlots
        .filter((slot) => slot.day === daySlot.day)
        .map((slot) => slot.slot);

      const freeTimeSlots = daySlot.timeSlots.filter(
        (time) => !bookedTimes.includes(time)
      );

      return {
        day: daySlot.day,
        timeSlots: freeTimeSlots,
        bookedSlots: bookedTimes,
      };
    });

    res.status(200).json({ availability: availableSlots });
  } catch (error) {
    console.error("Error fetching availability:", error.message);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
};


module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  getMyVenues,
  getVenueAvailability,
};
