import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxios from "@/hooks/useAxios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import RecommendedInvitesModal from "@/components/events/RecommendedInvites";

const EventPage = () => {
  const { eventId } = useParams();
  const axios = useAxios();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userJoined, setUserJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/events/${eventId}`);
        console.log("Event Data:", res.data);
        const user = JSON.parse(localStorage.getItem("user"));

        const alreadyJoined = res.data.participants.some(
          (participant) => participant._id === user._id
        );
        const userIsCreator = res.data.createdBy?._id === user._id;

        setEvent(res.data);
        setUserJoined(alreadyJoined);
        setIsCreator(userIsCreator);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load event details.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleJoinEvent = async () => {
    try {
      setJoining(true);
      await axios.post(`/events/${eventId}/join`);
      toast({
        title: "Joined Event",
        description: "You have successfully joined this event.",
      });

      const user = JSON.parse(localStorage.getItem("user"));

      setEvent((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          { _id: user._id, name: user.name, email: user.email },
        ],
      }));
      setUserJoined(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.msg?.desc || "Failed to join event.",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setJoining(true);
      await axios.post(`/events/${eventId}/leave`);
      toast({
        title: "Left Event",
        description: "You have successfully left this event.",
      });

      const user = JSON.parse(localStorage.getItem("user"));

      setEvent((prev) => ({
        ...prev,
        participants: prev.participants.filter(
          (participant) => participant._id !== user._id
        ),
      }));
      setUserJoined(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.msg?.desc || "Failed to leave event.",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`/events/${eventId}`);
      toast({
        title: "Event Deleted",
        description: "The event has been removed successfully.",
      });
      navigate("/events");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.msg?.desc || "Failed to delete event.",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        <Skeleton className="w-full h-40 rounded-lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        <p className="text-gray-600">Event not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {event.sportType} - {event.skillLevel.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {event.description || "No description available."}
          </p>
          <div className="mt-4 space-y-1">
            <Label>Location:</Label>
            <p>{event.location}</p>

            <Label>Date & Time:</Label>
            <p>
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </p>

            <Label>Event Creator:</Label>
            {event.organizer ? (
              <p>
                {event.organizer.name} ({event.organizer.email})
              </p>
            ) : (
              <p>Creator information not available.</p>
            )}

            <Label>Participants:</Label>
            <ul className="list-disc pl-4">
              {event.participants?.length > 0 ? (
                event.participants.map((user) => (
                  <li key={user._id}>
                    {user.name} ({user.email})
                  </li>
                ))
              ) : (
                <p>No participants yet.</p>
              )}
            </ul>
          </div>
        </CardContent>
      
        
      

        <CardFooter className="flex justify-between">
          {event.isFull ? (
            <Button disabled>Event Full</Button>
          ) : userJoined ? (
            <Button
              variant="destructive"
              onClick={handleLeaveEvent}
              disabled={joining}
            >
              {joining ? "Leaving..." : "Leave Event"}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleJoinEvent}
              disabled={joining}
            >
              {joining ? "Joining..." : "Join Event"}
            </Button>
          )}
            <RecommendedInvitesModal
            eventId={eventId}
            currentParticipants={event.participants.map((p) => String(p._id))}
            onInvite={(invitedId) => {
              const invitedUser = {
                _id: invitedId,
                name: "Invited User",
                email: "unknown@email.com",
              };
              setEvent((prev) => ({
                ...prev,
                participants: [...prev.participants, invitedUser],
              }));
            }}
          />
          {isCreator && (
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventPage;
