import { useState, useEffect } from "react";
import EventContext from "./EventContext";
import useAxios from "@/hooks/useAxios";
import useUser from "@/context/User/UserHook";

type Venue = {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
};

type Event = {
  _id: string;
  title: string;
  description?: string;
  sportType: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  date: string;
  time: string;
  venue?: Venue;
  customLocation?: string;
  maxParticipants: number;
  participants: string[];
  createdBy: string;
  status: "upcoming" | "completed" | "canceled";
  userJoined?: boolean;
  isFull?: boolean;
};

type CreateEventInput = {
  title: string;
  description?: string;
  sportType: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  date: string;
  time: string;
  maxParticipants: number;
  customLocation?: string;
  venueId?: string;
};

type EventProviderProps = {
  children: React.ReactNode;
};

const EventProvider = ({ children }: EventProviderProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const axios = useAxios();
  const { user } = useUser();
  const [recommendedEvents, setRecommendedEvents] = useState<
    RecommendedEvent[]
  >([]);

  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>(
    []
  );

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/events");
      setEvents(res.data);
      console.log("events fetch", res);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const createEvent = async (eventData: CreateEventInput) => {
    try {
      const res = await axios.post("/events/create-with-booking", eventData);
      if (res.data?.data?.event) {
        setEvents((prev) => [...prev, res.data.data.event]);
        return res.data;
      } else {
        throw new Error(
          `Unexpected response structure: ${JSON.stringify(res.data)}`
        );
      }
    } catch (error) {
      console.error("Failed to create event with booking:", error);
      throw error;
    }
  };

  const fetchMyCreatedEvents = async () => {
    try {
      const res = await axios.get("/events/my/created");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch created events:", error);
      return [];
    }
  };

  const fetchMyJoinedEvents = async () => {
    try {
      const res = await axios.get("/events/my/joined");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch joined events:", error);
      return [];
    }
  };

  const fetchRecommendedUsers = async (): Promise<RecommendedUser[]> => {
    try {
      const res = await axios.get("/events/recommended-users");
      const users = Array.isArray(res.data?.recommended_users)
        ? res.data.recommended_users
        : [];
      setRecommendedUsers(users);
      return users;
    } catch (error) {
      console.error("Failed to load recommended users:", error);
      setRecommendedUsers([]);
      return [];
    }
  };

  const fetchRecommendations = async (): Promise<RecommendedEvent[]> => {
    try {
      const res = await axios.get("/events/recs");
      if (Array.isArray(res.data?.recommendations)) {
        setRecommendedEvents(res.data.recommendations);
        return res.data.recommendations;
      } else {
        setRecommendedEvents([]);
        return [];
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch recommended events.",
      });
      setRecommendedEvents([]);
      return [];
    }
  };
  const inviteUser = async (eventId: string, userIdToInvite: string) => {
    try {
      await axios.post(`/events/${eventId}/invite`, { userIdToInvite });
    } catch (error) {
      console.error("Failed to invite user:", error);
      throw error;
    }
  };
  const joinEvent = async (eventId: string) => {
    try {
      await axios.post(`/events/${eventId}/join`);
    } catch (error) {
      console.error("Failed to join event:", error);
      throw error;
    }
  };

  const leaveEvent = async (eventId: string) => {
    try {
      await axios.post(`/events/${eventId}/leave`);
    } catch (error) {
      console.error("Failed to leave event:", error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }
  };

  const fetchEventById = async (eventId: string): Promise<Event | null> => {
    try {
      const res = await axios.get(`/events/${eventId}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch event by ID:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user || !user.token) return;
    fetchEvents();
  }, [user]);

  return (
    <EventContext.Provider
      value={{
        events,
        setEvents,
        createEvent,
        fetchEvents,
        fetchMyCreatedEvents,
        fetchMyJoinedEvents,
        fetchRecommendations,
        recommendedEvents,
        setRecommendedEvents,
        fetchRecommendedUsers,
        recommendedUsers,
        setRecommendedUsers,
        inviteUser,
        joinEvent,
        leaveEvent,
        deleteEvent,
        fetchEventById
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default EventProvider;
