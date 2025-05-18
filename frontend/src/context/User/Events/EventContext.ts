import { createContext } from "react";

export type Venue = {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
};

export type Event = {
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

export type RecommendedEvent = {
  _id: string;
  title: string;
  sportType: string;
  skillLevel: string;
  date?: string;
  time?: string;
  venue?: Venue;
  maxParticipants?: number;
  participants?: any[];
  description?: string;
};

export type CreateEventInput = {
  title: string;
  description?: string;
  sportType: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  date: string;
  time: string;
  maxParticipants: number;
  customLocation?: string;
  venueId?: string;
  slot?: {
    start: string;
    end: string;
  };
};

type RecommendedUser = {
  _id: string;
  email: string;
  score: number;
  skillLevel?: string;
};


type EventContextType = {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  createEvent: (eventData: CreateEventInput) => Promise<any>;
  fetchEvents: () => Promise<void>;
  fetchMyCreatedEvents: () => Promise<Event[]>;
  fetchMyJoinedEvents: () => Promise<Event[]>;
  fetchRecommendations: () => Promise<RecommendedEvent[]>;
  recommendedEvents: RecommendedEvent[];
  setRecommendedEvents: React.Dispatch<React.SetStateAction<RecommendedEvent[]>>;
  fetchRecommendedUsers: () => Promise<RecommendedUser[]>;
  recommendedUsers: RecommendedUser[];
  setRecommendedUsers: React.Dispatch<React.SetStateAction<RecommendedUser[]>>;
  inviteUser: (eventId: string, userIdToInvite: string) => Promise<void>;
  inviteUser: (eventId: string, userIdToInvite: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

};

const EventContext = createContext<EventContextType | undefined>(undefined);

export default EventContext;
