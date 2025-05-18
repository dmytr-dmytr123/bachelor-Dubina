import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/Chat/ChatWindow";
import useChat from "@/context/Chat/ChatHook";

const ChatListPage = () => {
  const { chats, fetchChats } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-full sm:w-1/3 border-r overflow-y-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Chats</h1>
        {chats.map((chat) => (
          <Card
            key={chat.user._id}
            className={`p-4 mb-4 cursor-pointer ${
              selectedUser?._id === chat.user._id ? "bg-indigo-50 border-indigo-400" : ""
            }`}
            onClick={() => setSelectedUser(chat.user)}
          >
            <div>
              <p className="font-semibold">{chat.user.name}</p>
              <p className="text-sm text-gray-500">{chat.user.email}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Last message: {chat.lastMessage.slice(0, 100)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden sm:flex flex-col flex-1 items-center justify-center">
  {selectedUser ? (
    <div className="w-full h-full">
      <ChatWindow user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  ) : (
    <div className="m-auto text-gray-400">← Select a chat to start messaging</div>
  )}
</div>

    </div>
  );
};

export default ChatListPage;
