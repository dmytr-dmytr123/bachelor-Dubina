import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useAxios from "@/hooks/useAxios";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import ChatMiniModal from "@/components/Chat/ChatMini";
import useFriends from "@/context/Friends/FriendsHook";

const AllUsers = () => {
  const axios = useAxios();
  const { toast } = useToast();
  const {
    friends,
    sentRequests,
    sendRequest,
    cancelRequest,
    fetchAllFriendsData,
  } = useFriends();

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [chatUser, setChatUser] = useState(null);

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/friends/all_users");
      setUsers(res.data);
    } catch {
      toast({ title: "Failed to load users" });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllFriendsData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const nameMatch =
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase());
    const sportMatch = selectedSport ? u.preferences?.sports?.includes(selectedSport) : true;
    const levelMatch = selectedLevel ? u.preferences?.skillLevel === selectedLevel : true;
    const timeMatch = selectedTime ? u.preferences?.timeOfDay?.includes(selectedTime) : true;
    const locationMatch = selectedLocation ? u.preferences?.location === selectedLocation : true;

    return nameMatch && sportMatch && levelMatch && timeMatch && locationMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Input
        placeholder="Search by name or email"
        className="mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-full">Sport</SelectTrigger>
          <SelectContent>
            <SelectItem value="Basketball">Basketball</SelectItem>
            <SelectItem value="Football">Football</SelectItem>
            <SelectItem value="Running">Running</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full">Skill Level</SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger className="w-full">Time of day</SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        />
      </div>

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
                  {user.preferences?.sports?.join(", ")} • {user.preferences?.skillLevel} •{" "}
                  {user.preferences?.timeOfDay?.join(", ")} • {user.preferences?.location}
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
