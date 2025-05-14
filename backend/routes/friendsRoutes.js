const express = require("express");
const {
  addFriend,
  removeFriend,
  getAllFriends,
  getAllUsers,
  acceptFriendRequest,
  cancelSentFriendRequest,
  getFriendRequests,
  getSentFriendRequests
} = require("../controllers/friendsControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", protect, addFriend);
router.post("/remove", protect, removeFriend);
router.get("/all_users", protect, getAllUsers);
router.get("/my", protect, getAllFriends);
router.get("/requests", protect, getFriendRequests);
router.post("/accept", protect, acceptFriendRequest);
router.post("/cancel", protect, cancelSentFriendRequest);
router.get("/sent_requests", protect, getSentFriendRequests);

module.exports = router;