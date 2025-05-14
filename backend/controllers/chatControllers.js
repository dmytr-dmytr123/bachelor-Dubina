const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, content } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new Error("Recipient not found.");
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    
    if (req.io) {
      req.io.to(recipientId.toString()).emit("message:receive", {
        _id: message._id,
        sender: senderId,
        recipient: recipientId,
        content,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ msg: { title: error.message } });
  }
};

const getChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const withUserId = req.params.withUserId;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: withUserId },
        { sender: withUserId, recipient: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ msg: { title: error.message } });
  }
};

const getAllChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "_id name email")
      .populate("recipient", "_id name email");

    const chatMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.equals(userId);
      const otherUser = isSender ? msg.recipient : msg.sender;
      const otherUserId = otherUser._id.toString();

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
          },
          lastMessage: msg.content,
          lastTime: msg.createdAt,
        });
      }
    });

    const chats = Array.from(chatMap.values());
    res.status(200).json(chats);
  } catch (err) {
    console.error("getAllChats error:", err);
    res.status(400).json({ msg: { title: err.message } });
  }
};


module.exports = { sendMessage, getChat, getAllChats };
