import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useChat from "@/context/Chat/ChatHook";
import useUser from "@/context/User/UserHook";

const ChatWindow = ({ user, onClose }) => {
  const { user: currentUser } = useUser();
  const { messagesMap, fetchMessagesFor, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const messages = messagesMap[user._id] || [];

  useEffect(() => {
    fetchMessagesFor(user._id);
  }, [user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(user._id, input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-l shadow-inner">
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="font-semibold text-lg">Chat with {user.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id + msg.createdAt}
            className={`max-w-[400px] px-4 py-2 rounded-xl text-sm shadow ${
              msg.sender === currentUser._id
                ? "bg-indigo-500 text-white ml-auto"
                : "bg-gray-100 text-gray-800 mr-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-full"
        />
        <Button size="icon" onClick={handleSend} className="rounded-full">
          ➤
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
