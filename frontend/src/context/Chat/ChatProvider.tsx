import { useEffect, useState } from "react";
import ChatContext, { ChatPreview, Message } from "./ChatContext";
import useAxios from "@/hooks/useAxios";
import useUser from "@/context/User/UserHook";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL);

const ChatProvider = ({ children }) => {
  const axios = useAxios();
  const { user } = useUser();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

  const fetchChats = async () => {
    try {
      const res = await axios.get("/chat/all");
      setChats(res.data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  const fetchMessagesFor = async (userId: string) => {
    try {
      const res = await axios.get(`/chat/with/${userId}`);
      setMessagesMap((prev) => ({
        ...prev,
        [userId]: res.data,
      }));
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    try {
      const res = await axios.post("/chat/send", { recipientId, content });
      const msg = res.data;
      setMessagesMap((prev) => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), msg],
      }));
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    socket.emit("join", user._id);

    const handleReceive = (msg: Message) => {
      const peerId = msg.sender === user._id ? msg.recipient : msg.sender;
      setMessagesMap((prev) => ({
        ...prev,
        [peerId]: [...(prev[peerId] || []), msg],
      }));
    };

    socket.on("message:receive", handleReceive);
    return () => socket.off("message:receive", handleReceive);
  }, [user?._id]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        messagesMap,
        fetchChats,
        fetchMessagesFor,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
