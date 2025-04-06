import { createContext } from "react";

type Event = {
  _id: string;
  title: string;
  description?: string;
  sportType: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  date: string;
  time: string;
  venue?: string;
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
  venueId: string;
  slot: {
    start: string;
    end: string;
  };
};


type EventContextType = {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  createEvent: (eventData: CreateEventInput) => Promise<void>;
  fetchEvents: () => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export default EventContext;
