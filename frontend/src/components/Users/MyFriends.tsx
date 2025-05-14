import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useFriends from "@/context/Friends/FriendsHook";
import ChatMiniModal from "@/components/Chat/ChatMini";

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-10">
      {requests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Friend requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <Card key={req._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{req.name}</p>
                  <p className="text-sm text-gray-500">{req.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => acceptRequest(req._id)}>Accept</Button>
                  <Button variant="destructive" onClick={() => rejectRequest(req._id)}>
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">My friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">You have no friends yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Card key={friend._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setChatUser(friend)}>Message</Button>
                  <Button variant="destructive" onClick={() => removeFriend(friend._id)}>
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
