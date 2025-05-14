const express = require("express");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
require("./jobs/cleanup");

const connectDB = require("./config/db");
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  req.io = io; // дозволяє emit з REST
  next();
});

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

const Message = require("./models/messageModel");
const User = require("./models/userModel");

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`🧍 User ${userId} joined room ${userId}`);
  });

  socket.on("message:send", async ({ senderId, recipientId, content }) => {
    try {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        console.log("recipient not found");
        return;
      }

      const message = await Message.create({ sender: senderId, recipient: recipientId, content });

      io.to(recipientId.toString()).emit("message:receive", {
        _id: message._id,
        sender: senderId,
        recipient: recipientId,
        content,
        createdAt: message.createdAt
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
  });
});

connectDB();
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
