import { useState, useEffect } from "react";
import EventContext from "./EventContext";
import useAxios from "@/hooks/useAxios";

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
        throw new Error(`Unexpected response structure: ${JSON.stringify(res.data)}`);
      }
    } catch (error) {
      console.error("Failed to create event with booking:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventContext.Provider value={{ events, setEvents, fetchEvents, createEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export default EventProvider;
