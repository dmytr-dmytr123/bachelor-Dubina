import { useState, useEffect } from "react";
import FriendsContext, { FriendUser } from "./FriendsContext";
import useAxios from "@/hooks/useAxios";
import { useToast } from "@/components/ui/use-toast";
import useUser from "@/context/User/UserHook";

const FriendsProvider = ({ children }) => {
  const axios = useAxios();
  const { toast } = useToast();
  const { user } = useUser();
  const [allUsers, setAllUsers] = useState<FriendUser[]>([]);

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const fetchAllFriendsData = async () => {
    try {
      const [fRes, rRes, sRes] = await Promise.all([
        axios.get("/friends/my"),
        axios.get("/friends/requests"),
        axios.get("/friends/sent_requests"),
      ]);
      setFriends(fRes.data);
      setRequests(rRes.data);
      setSentRequests(sRes.data.map((u: FriendUser) => u._id));
    } catch {
      toast({ title: "Failed to fetch friends data" });
    }
  };
  

  const acceptRequest = async (userId: string) => {
    await axios.post("/friends/accept", { senderId: userId });
    toast({ title: "Friend request accepted" });
    fetchAllFriendsData();
  };

  const rejectRequest = async (userId: string) => {
    await axios.post("/friends/reject", { senderId: userId });
    toast({ title: "Friend request rejected" });
    fetchAllFriendsData();
  };

  const removeFriend = async (userId: string) => {
    await axios.post("/friends/remove", { friendId: userId });
    toast({ title: "Friend removed" });
    fetchAllFriendsData();
  };

  const sendRequest = async (userId: string) => {
    await axios.post("/friends/add", { friendId: userId });
    toast({ title: "Friend request sent" });
    setSentRequests((prev) => [...prev, userId]);
  };

  const cancelRequest = async (userId: string) => {
    await axios.post("/friends/cancel", { recipientId: userId });
    toast({ title: "Friend request canceled" });
    setSentRequests((prev) => prev.filter((id) => id !== userId));
  };

const fetchAllUsers = async () => {
  try {
    const res = await axios.get("/friends/all_users");
    setAllUsers(res.data);
  } catch {
    toast({ title: "Failed to fetch users" });
  }
};

  useEffect(() => {
    if (!user || !user.token) return;
    fetchAllFriendsData();
    fetchAllUsers();
  }, [user]);
  

  return (
    <FriendsContext.Provider
      value={{
        allUsers,
        friends,
        requests,
        sentRequests,
        fetchAllFriendsData,
        acceptRequest,
        fetchAllUsers,
        rejectRequest,
        removeFriend,
        sendRequest,
        cancelRequest,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export default FriendsProvider;
