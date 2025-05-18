import { useRef, useEffect } from "react";
import { formatDateGroup } from "@/utils/formateDateGroup";

const MessageHelper = ({ messages, currentUser }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let lastDate = "";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
      {sortedMessages.map((msg) => {
        const msgDate = formatDateGroup(msg.createdAt);
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;

        const isMine = msg.sender === currentUser._id;
        const bubbleClass = isMine
          ? "bg-[#22C55D] text-white ml-auto"
          : "bg-gray-100 text-black mr-auto";
        const timeClass = isMine ? "text-white/70" : "text-gray-500";

        return (
          <div key={msg._id}>
            {showDate && (
              <div className="text-center my-4">
                <span className="inline-block bg-gray-300 text-xs text-gray-700 px-3 py-1 rounded-full">
                  {msgDate}
                </span>
              </div>
            )}

            <div className="flex">
              <div
                className={`break-words whitespace-pre-wrap px-4 py-2 pr-4 rounded-2xl shadow-sm max-w-[60%] min-w-[100px] ${bubbleClass}`}
                style={{ wordBreak: "break-word" }}
              >
                <div className="text-sm">{msg.content}</div>
                <div className={`text-[10px] mt-1 text-right ${timeClass}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageHelper;
