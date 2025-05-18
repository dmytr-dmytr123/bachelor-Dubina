import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useAxios from "@/hooks/useAxios";
import ChatMiniModal from "@/components/Chat/ChatMini";
import useFriends from "@/context/Friends/FriendsHook";
import UsersFilter from "@/components/Users/UsersFilter"; 

const AllUsers = () => {
  const axios = useAxios();
  const { toast } = useToast();
  const {
    friends,
    sentRequests,
    allUsers,
    fetchAllUsers,
    sendRequest,
    cancelRequest,
    fetchAllFriendsData,
  } = useFriends();
  

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  

  useEffect(() => {
    fetchAllUsers();
    fetchAllFriendsData();
  }, []);
  
  
  useEffect(() => {
    if (allUsers.length) setFilteredUsers(allUsers);
  }, [allUsers]);

  const handleFilter = ({ sport, level, time, location, search }) => {
    const searchTerm = search.toLowerCase().trim();
  
    const filtered = allUsers.filter((u) => {
      const nameMatch = searchTerm
        ? u.name.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          u.name.toLowerCase().split(" ").some((part) => part.startsWith(searchTerm))
        : true;
  
      const sportMatch = sport === "All" || u.preferences?.sports?.includes(sport);
      const levelMatch = level === "All" || u.preferences?.skillLevel === level;
      const timeMatch = time === "All" || u.preferences?.timeOfDay?.includes(time);
      const locationMatch = location === "All" || u.preferences?.location === location;
  
      return nameMatch && sportMatch && levelMatch && timeMatch && locationMatch;
    });
  
    setFilteredUsers(filtered);
  };
  

  return (
    <div className="max-w-7xl mx-auto px-4">
      <UsersFilter onFilter={handleFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => {
          const isFriend = friends.some((f) => f._id === user._id);
          const isSent = sentRequests.includes(user._id);

          return (
            <Card key={user._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs mt-1">
                  {user.preferences?.sports?.join(", ")} • {user.preferences?.skillLevel} • {user.preferences?.timeOfDay?.join(", ")} • {user.preferences?.location}
                </p>
              </div>
              <div className="flex gap-2">
                {isFriend ? (
                  <Button disabled variant="secondary">Friend</Button>
                ) : isSent ? (
                  <Button onClick={() => cancelRequest(user._id)} variant="destructive">
                    Cancel Request
                  </Button>
                ) : (
                  <Button onClick={() => sendRequest(user._id)}>Add</Button>
                )}
                <Button variant="outline" onClick={() => setChatUser(user)}>Message</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {chatUser && <ChatMiniModal user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
};

export default AllUsers;
