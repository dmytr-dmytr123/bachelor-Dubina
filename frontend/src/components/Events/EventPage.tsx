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
import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  UserRoundPlus,
  Trash2,
} from "lucide-react";
import useEvent from "@/context/User/Events/EventHook";

const EventPage = () => {
  const { eventId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userJoined, setUserJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const { fetchEventById, joinEvent, leaveEvent, deleteEvent, inviteUser } =
    useEvent();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetchEventById(eventId);
        const user = JSON.parse(localStorage.getItem("user"));

        const alreadyJoined = res.participants.some((p) => p._id === user._id);
        const userIsCreator = res.createdBy === user._id;

        setEvent(res);
        setUserJoined(alreadyJoined);
        setIsCreator(userIsCreator);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load event details.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

  const handleJoinEvent = async () => {
    try {
      setJoining(true);
      await joinEvent(eventId);
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
      await leaveEvent(eventId);
      toast({
        title: "Left Event",
        description: "You have successfully left this event.",
      });

      const user = JSON.parse(localStorage.getItem("user"));
      setEvent((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p._id !== user._id),
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
      await deleteEvent(eventId);
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
      <div className="max-w-4xl mx-auto mt-10 space-y-4">
        <Skeleton className="w-full h-48 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto mt-10 space-y-4 text-center">
        <p className="text-gray-600 text-lg">
          Event not found or failed to load.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Card className="shadow-xl border border-muted rounded-2xl p-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {event.title}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {event.sportType} – {event.skillLevel.toUpperCase()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-gray-700">
            {event.description || "No description provided."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span>
                {event.venue?.name}, {event.venue?.location?.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span>{event.participants?.length || 0} Participants</span>
            </div>
            <div className="flex items-center gap-2">
              <UserRoundPlus size={18} className="text-primary" />
              <span>
                {event.organizer
                  ? `${event.organizer.name} (${event.organizer.email})`
                  : "Creator info unavailable"}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Participants:</Label>
            <ul className="list-disc pl-5 mt-1 text-muted-foreground">
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

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
          <div className="flex flex-wrap gap-2">
            {event.isFull ? (
              <Button disabled className="w-full sm:w-auto">
                Event Full
              </Button>
            ) : userJoined ? (
              <Button
                variant="outline"
                onClick={handleLeaveEvent}
                disabled={joining}
              >
                {joining ? "Leaving..." : "Leave Event"}
              </Button>
            ) : (
              <Button onClick={handleJoinEvent} disabled={joining}>
                {joining ? "Joining..." : "Join Event"}
              </Button>
            )}
            <RecommendedInvitesModal
              eventId={eventId}
              currentParticipants={event.participants.map((p) => String(p._id))}
              onInvite={async (invitedId) => {
                await inviteUser(eventId, invitedId);
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
          </div>
          {isCreator && (
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              className="flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete Event
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventPage;
