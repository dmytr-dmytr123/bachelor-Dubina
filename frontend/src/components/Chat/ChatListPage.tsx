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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-full shadow-sm">
              💬
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Chats</h1>
              <p className="text-sm text-gray-500">Start a conversation</p>
            </div>
          </div>
        </div>
        <Card className="rounded-xl border shadow-sm">
          {chats.map((chat) => (
            <Card
              key={chat.user._id}
              onClick={() => setSelectedUser(chat.user)}
              className={`group border-none flex items-center gap-3 p-4 transition duration-200  shadow-sm cursor-pointer 
            ${
              selectedUser?._id === chat.user._id
                ? "bg-green-100"
                : "bg-white hover:bg-gray-50 "
            }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-green-200 rounded-full text-green-800 font-bold uppercase">
                {chat.user.name?.slice(0, 1) || "U"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition">
                  {chat.user.name || "Unnamed User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {chat.user.email}
                </p>
                <p className="mt-1 text-sm text-gray-700 truncate">
                  {chat.lastMessage ? (
                    <span className="block text-ellipsis whitespace-nowrap font-normal text-gray-600">
                      {chat.lastMessage.slice(0, 60)}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">
                      No messages yet
                    </span>
                  )}
                </p>
              </div>
            </Card>
          ))}
        </Card>
      </div>

      <div className="hidden sm:flex flex-col flex-1 items-center justify-center">
        {selectedUser ? (
          <div className="w-full h-full">
            <ChatWindow
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              
            />
          </div>
        ) : (
          <div className="m-auto text-gray-400">
            ← Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListPage;
