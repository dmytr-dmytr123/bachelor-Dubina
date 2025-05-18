import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useChat from "@/context/Chat/ChatHook";
import useUser from "@/context/User/UserHook";
import MessageHelper from "@/components/Chat/MessageHelper";

const ChatWindow = ({ user, onClose }) => {
  const { user: currentUser } = useUser();
  const { messagesMap, fetchMessagesFor, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messages = messagesMap[user._id] || [];

  useEffect(() => {
    fetchMessagesFor(user._id);
  }, [user._id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(user._id, input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex justify-between items-center p-4 border-b from-indigo-500 to-purple-600 text-black">
        <h2 className="font-semibold text-lg">Chat with {user.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white"
        >
          ✕
        </Button>
      </div>

      <MessageHelper messages={messages} currentUser={currentUser} />

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend}>
          ➤
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
