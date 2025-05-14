import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUser from "@/context/User/UserHook";
import useChat from "@/context/Chat/ChatHook";

const ChatMiniModal = ({ user, onClose }) => {
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
    <div className="fixed bottom-4 right-4 w-full sm:w-96 h-[80vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col border border-gray-300 animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
        <p className="font-semibold">💬 Chat with {user.name}</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg._id + msg.createdAt}
            className={`p-2 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap break-words ${
              msg.sender === currentUser._id ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-800 mr-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t p-3 bg-white rounded-b-2xl">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border-gray-300 rounded-full px-4"
        />
        <Button size="sm" onClick={handleSend} className="rounded-full px-4">
          ➤
        </Button>
      </div>
    </div>
  );
};

export default ChatMiniModal;
