import { useState, ReactNode } from "react";
import BookingContext, { Booking } from "./BookingContext";
import useAxios from "@/hooks/useAxios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const axios = useAxios();

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings", error);
    }
  };

  const createBooking = async (data: Omit<Booking, "_id" | "paymentStatus" | "paymentIntentId">) => {
    try {
      const response = await axios.post("/api/bookings/create-payment", data);
      const { clientSecret, booking } = response.data;

      //handle payment on client side
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: { token: "tok_visa" },
          billing_details: {
            name: "name name",
            email: "name@example.com",
          },
        },
      });

      if (error) {
        console.error("Payment failed:", error.message);
        throw new Error("Payment failed");
      }

      //update booking status after payment
      booking.status = "active";
      booking.paymentStatus = "succeeded";
      setBookings((prev) => [...prev, booking]);
    } catch (error) {
      console.error("Error creating booking with payment", error);
    }
  };

  const completeBookingPayment = async (id: string) => {
    try {
      await axios.post(`/api/bookings/${id}/complete`);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id ? { ...booking, status: "completed", paymentStatus: "succeeded" } : booking
        )
      );
    } catch (error) {
      console.error("Error completing booking payment", error);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await axios.delete(`/api/bookings/${id}`);
      setBookings((prev) => prev.filter((booking) => booking._id !== id));
    } catch (error) {
      console.error("Error cancelling booking", error);
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, setBookings, fetchBookings, createBooking, completeBookingPayment, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingProvider;
