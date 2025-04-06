import { useState } from "react";
import VenueContext, { Venue } from "./VenueContext";
import useAxios from "@/hooks/useAxios";

const VenueProvider = ({ children }: { children: React.ReactNode }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const axios = useAxios();

  const fetchVenues = async () => {
    try {
      const res = await axios.get("/venues");
      setVenues(res.data);
    } catch (error) {
      console.error("Failed to fetch venues", error);
    }
  };
  const [availability, setAvailability] = useState<any[]>([]);

  const fetchAvailability = async (venueId: string) => {
    try {
      const response = await axios.get(`/venues/${venueId}/availability`);

      if (response.status !== 200 || !response.data.availability) {
        throw new Error("Invalid availability data structure");
      }

      setAvailability(response.data.availability);
      return response.data.availability;
    } catch (error) {
      console.error("Error fetching availability:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch venue availability.",
      });
    }
  };

  const fetchMyVenues = async () => {
    try {
      const res = await axios.get("/venues/my");
      setVenues(res.data);
    } catch (error) {
      console.error("Failed to fetch my venues", error);
    }
  };
  const createVenue = async (
    data: Omit<Venue, "_id" | "owner">
  ): Promise<Venue> => {
    try {
      const res = await axios.post("/venues", data);
      const createdVenue = res.data.venue;
      setVenues((prev) => [...prev, createdVenue]);
      return createdVenue;
    } catch (error) {
      console.error("Failed to create venue", error);
      throw error;
    }
  };

  const deleteVenue = async (venueId: string) => {
    try {
      await axios.delete(`/venues/${venueId}`);
      setVenues((prev) => prev.filter((venue) => venue._id !== venueId));
    } catch (error) {
      console.error("Failed to delete venue", error);
      throw error;
    }
  };
  const updateVenue = async (
    id: string,
    data: Partial<Omit<Venue, "_id" | "owner">>
  ) => {
    try {
      await axios.put(`/venues/${id}`, data);
      setVenues((prev) =>
        prev.map((v) => (v._id === id ? { ...v, ...data } : v))
      );
    } catch (error) {
      console.error("Failed to update venue", error);
      throw error;
    }
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        setVenues,
        availability,
        setAvailability,
        fetchVenues,
        fetchMyVenues,
        createVenue,
        deleteVenue,
        updateVenue,
        fetchAvailability,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export default VenueProvider;
