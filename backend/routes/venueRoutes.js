const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  getMyVenues,
  getVenueAvailability
} = require("../controllers/venueControllers");

router.get("/", getAllVenues);
router.get("/my", protect, getMyVenues);
router.get("/:venueId/availability", getVenueAvailability);
router.get("/:venueId", getVenueById);
router.post("/", protect, createVenue);
router.put("/:venueId", protect, updateVenue);
router.delete("/:venueId", protect, deleteVenue);

module.exports = router;
