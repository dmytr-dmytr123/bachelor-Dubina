import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useFriends from "@/context/Friends/FriendsHook";
import ChatMiniModal from "@/components/Chat/ChatMini";
import { MessageSquare, UserPlus, X } from "lucide-react";

const MyFriends = () => {
  const {
    friends,
    requests,
    acceptRequest,
    rejectRequest,
    removeFriend,
    fetchAllFriendsData,
  } = useFriends();

  const [chatUser, setChatUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllFriendsData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {requests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📨 Friend Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <Card
                key={req._id}
                className="p-5 border border-gray-200 shadow-sm rounded-xl flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{req.name}</p>
                  <p className="text-sm text-muted-foreground">{req.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex gap-1 items-center"
                    onClick={() => acceptRequest(req._id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex gap-1 items-center"
                    onClick={() => rejectRequest(req._id)}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">👥 My Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">You have no friends yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <Card
                key={friend._id}
                className="p-5 border border-gray-200 shadow-sm rounded-xl flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{friend.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex gap-1 items-center"
                    onClick={() => setChatUser(friend)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex gap-1 items-center"
                    onClick={() => removeFriend(friend._id)}
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {chatUser && <ChatMiniModal user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
};

export default MyFriends;
