const express = require("express");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

require("./jobs/cleanup");
const connectDB = require("./config/db");
const homeRoutes = require("./routes/routes");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const venueRoutes = require("./routes/venueRoutes");
const protectRoutes = require("./routes/protectRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const { crossOrigin } = require("./middlewares/corsMiddleware");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
crossOrigin(app);
app.use("/api", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protect", protectRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(
  "/api/bookings/webhook",
  bodyParser.raw({ type: "application/json" })
);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(path.dirname(__dirname1), "frontend", "dist")),
  );
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(path.dirname(__dirname1), "frontend", "dist", "index.html"),
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is up and running!");
  });
}

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server Started on Port: " + PORT);
  connectDB();
});
