import { useContext } from "react";
import ChatContext from "./ChatContext";

const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export default useChat;
