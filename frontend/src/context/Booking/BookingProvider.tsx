import { useState, ReactNode } from "react";
import BookingContext, { Booking } from "./BookingContext";
import useAxios from "@/hooks/useAxios";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/components/ui/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const axios = useAxios();
  const { toast } = useToast();

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get("/bookings/users-bookings");
      console.log("My bookings:", res.data.bookings);
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Failed to fetch user bookings", err);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await axios.delete(`/bookings/${bookingId}`);
      toast({ title: "Booking cancelled" });
    } catch (err) {
      toast({ title: "Error cancelling booking", variant: "destructive" });
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/bookings/all");
      console.log("All bookings:", res.data.bookings);
    } catch (err) {
      console.error("Error fetching all bookings", err);
    }
  };

  const getBookedSlots = async (
    venueId: string,
    date: string
  ): Promise<string[]> => {
    try {
      const res = await axios.get(`/bookings/venue/${venueId}/slots/${date}`);
      return res.data.bookedSlots || [];
    } catch (err) {
      console.error("Error fetching booked slots", err);
      return [];
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        setBookings,
        fetchBookings,
        cancelBooking,
        getBookedSlots,
        fetchMyBookings
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export default BookingProvider;
