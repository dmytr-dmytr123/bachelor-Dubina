import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const InvitationsModal = () => {
  const axios = useAxios();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const fetchInvitations = async () => {
    try {
      const res = await axios.get("/events/my/invitations");
      console.log("invit", res);
      setInvitations(res.data.invitations || []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invitations",
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/accept`);
      toast({ title: "Joined Event", description: "You have joined the event!" });
      setInvitations(prev => prev.filter((e) => e._id !== eventId));
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to join" });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Event Invitations</DialogTitle>
        <DialogDescription>See which events you were invited to:</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {invitations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending invitations.</p>
        ) : (
          invitations.map((event) => (
            <div
              key={event._id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.date?.slice(0, 10)} at {event.time}
                </p>
              </div>
              <Button size="sm" onClick={() => handleAccept(event._id)}>
                Accept
              </Button>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  );
};

export default InvitationsModal;
