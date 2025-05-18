const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const homeRoutes = require("./routes/routes");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const venueRoutes = require("./routes/venueRoutes");
const protectRoutes = require("./routes/protectRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const messageRoutes = require("./routes/chatRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const { crossOrigin } = require("./middlewares/corsMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
crossOrigin(app);

app.use("/api", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protect", protectRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/friends", friendsRoutes);
app.use(
  "/api/bookings/webhook",
  bodyParser.raw({ type: "application/json" })
);

module.exports = app;
