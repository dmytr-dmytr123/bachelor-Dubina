import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useAxios from "@/hooks/useAxios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const RecommendedInvitesModal = ({ eventId, currentParticipants = [], onInvite }) => {
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const { toast } = useToast();
  const axios = useAxios();

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        const res = await axios.get("/events/recommended-users");

        const recommendations = Array.isArray(res.data?.recommendations?.recommendations)
          ? res.data.recommendations.recommendations
          : [];

        const participantIds = currentParticipants.map(String);
        const filtered = recommendations.filter(
          (rec) => !participantIds.includes(rec.user._id)
        );

        setRecommendedUsers(filtered);
      } catch (err) {
        console.error("Failed to load recommended users:", err);
      }
    };

    fetchRecommendedUsers();
  }, [currentParticipants, eventId]);

  const handleInvite = async (userId) => {
    try {
      await axios.post(`/events/${eventId}/invite`, {
        userIdToInvite: userId,
      });

      toast({
        title: "User Invited",
        description: `User ${userId.slice(-4)} was invited successfully.`,
      });

      setRecommendedUsers((prev) =>
        prev.filter((u) => u.user._id !== userId)
      );

      if (onInvite) {
        onInvite(userId);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Invite failed",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Users</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recommended Users to Invite</DialogTitle>
          <DialogDescription>
            Based on your preferences, we recommend these users for this event.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc pl-4 mt-2 space-y-2 max-h-60 overflow-y-auto">
          {recommendedUsers.length > 0 ? (
            recommendedUsers.map(({ user }) => (
              <li key={user._id} className="flex items-center justify-between">
                <span>
                  {user._id.slice(-4)} ({user.skillLevel})
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleInvite(user._id)}
                >
                  Invite
                </Button>
              </li>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recommended users to invite.</p>
          )}
        </ul>

        <DialogFooter>
          <Button variant="ghost">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendedInvitesModal;
