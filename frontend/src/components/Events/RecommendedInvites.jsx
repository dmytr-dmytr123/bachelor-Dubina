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
import useEvent from "@/context/User/Events/EventHook";

const RecommendedInvitesModal = ({
  eventId,
  currentParticipants = [],
  onInvite,
}) => {
  const { toast } = useToast();
  const axios = useAxios();
  const {
    fetchRecommendedUsers,
    recommendedUsers,
    setRecommendedUsers,
    inviteUser,
  } = useEvent();

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchRecommendedUsers();
      const participantIds = currentParticipants.map(String);
      const filtered = users.filter(
        (u) => u && !participantIds.includes(u._id)
      );
      setRecommendedUsers(filtered);
    };

    fetchData();
  }, [currentParticipants, eventId]);

  const handleInvite = async (userId) => {
    try {
      await inviteUser(eventId, userId);

      toast({
        title: "User invited",
        description: `User ${userId.slice(-4)} was invited successfully.`,
      });

      setRecommendedUsers((prev) => prev.filter((u) => u._id !== userId));

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
            recommendedUsers.map((user) => (
              <li key={user._id} className="flex items-center justify-between">
                <span>
                  {user.email} {user.skillLevel}
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
            <p className="text-sm text-muted-foreground">
              Looading...
            </p>
          )}
        </ul>

      
      </DialogContent>
    </Dialog>
  );
};

export default RecommendedInvitesModal;
