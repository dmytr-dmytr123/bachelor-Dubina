import { createContext } from "react";

export type Message = {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type ChatUser = {
  _id: string;
  name: string;
  email: string;
};

export type ChatPreview = {
  user: ChatUser;
  lastMessage: string;
};

type ChatContextType = {
  chats: ChatPreview[];
  messagesMap: Record<string, Message[]>;
  fetchChats: () => Promise<void>;
  fetchMessagesFor: (userId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export default ChatContext;
