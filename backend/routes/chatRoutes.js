const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { sendMessage, getChat,getAllChats } = require("../controllers/chatControllers");

router.post("/send", protect, sendMessage);
router.get("/with/:withUserId", protect, getChat);
router.get("/all", protect, getAllChats);

module.exports = router;
