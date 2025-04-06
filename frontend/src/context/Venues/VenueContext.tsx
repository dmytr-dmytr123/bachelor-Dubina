import { createContext } from "react";

export type Venue = {
  _id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    city: string;
  };
  sports: string[];
  availability: {
    day: string;
    startTime: string;
    endTime: string;
    timeSlots: string[];
  }[];
  pricingPerHour: number;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
};


type VenueContextType = {
  venues: Venue[];
  setVenues: React.Dispatch<React.SetStateAction<Venue[]>>;
  availability: any[];
  setAvailability: React.Dispatch<React.SetStateAction<any[]>>;
  fetchVenues: () => Promise<void>;
  fetchMyVenues: () => Promise<void>;
  createVenue: (data: Omit<Venue, "_id" | "owner">) => Promise<void>;
  deleteVenue: (venueId: string) => Promise<void>;
  updateVenue: (id: string, data: Partial<Omit<Venue, "_id" | "owner">>) => Promise<void>;
  fetchAvailability: (venueId: string) => Promise<any[]>;
};

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export default VenueContext;
