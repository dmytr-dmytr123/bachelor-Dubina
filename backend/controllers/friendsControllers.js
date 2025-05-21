const User = require("../models/userModel");

const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === friendId)
      throw new Error("You can't add yourself.");

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) throw new Error("User not found.");
    if (user.friends.includes(friendId)) throw new Error("Already friends.");
    if (friend.friendRequests?.includes(userId))
      throw new Error("Friend request already sent.");

    friend.friendRequests = friend.friendRequests || [];
    user.sentRequests = user.sentRequests || [];

    friend.friendRequests.push(userId);
    user.sentRequests.push(friendId);

    await friend.save();
    await user.save();

    res.status(200).send({ msg: { title: "Friend request sent!" } });
  } catch (error) {
    res.status(400).send({ msg: { title: error.message } });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) throw new Error("User not found.");

    if (!user.friendRequests.includes(senderId))
      throw new Error("No such friend request.");

    user.friends.push(senderId);
    sender.friends.push(userId);
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await user.save();
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await sender.save();

    res.status(200).send({ msg: { title: "Friend request accepted!" } });
  } catch (error) {
    res.status(400).send({ msg: { title: error.message } });
  }
};

const cancelSentFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) throw new Error("User not found.");

    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== senderId.toString()
    );

    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== recipientId.toString()
    );

    await recipient.save();
    await sender.save();

    res.status(200).send({ msg: { title: "Friend request canceled." } });
  } catch (error) {
    res.status(400).send({ msg: { title: error.message } });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) throw new Error("User not found.");

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    await user.save();

    if (friend) {
      friend.friends = friend.friends.filter((id) => id.toString() !== userId);
      await friend.save();
    }

    res.status(200).send({ msg: { title: "Friend removed from both sides." } });
  } catch (error) {
    res.status(400).send({ msg: { title: error.message } });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ msg: { title: error.message } });
  }
};

const getAllFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "_id name email"
    );
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).send({ msg: { title: error.message } });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendRequests",
      "_id name email"
    );
    res.status(200).json(user.friendRequests || []);
  } catch (error) {
    res.status(500).send({ msg: { title: error.message } });
  }
};
const getSentFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "sentRequests",
      "_id name email"
    );
    res.status(200).json(user.sentRequests || []);
  } catch (error) {
    res.status(500).send({ msg: { title: error.message } });
  }
};


const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) throw new Error("User not found.");

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await sender.save();

    res.status(200).send({ msg: { title: "Friend request rejected." } });
  } catch (error) {
    res.status(400).send({ msg: { title: error.message } });
  }
};

module.exports = {
  addFriend,
  acceptFriendRequest,
  removeFriend,
  getAllUsers,
  getAllFriends,
  getFriendRequests,
  cancelSentFriendRequest,
  getSentFriendRequests,
  rejectFriendRequest,
  
};
