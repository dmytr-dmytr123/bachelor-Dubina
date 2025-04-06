import { createContext } from "react";

export type Booking = {
  _id: string;
  user: string;
  venue: string;
  event?: string;
  slot: {
    start: Date;
    end: Date;
  };
  status: "pending" | "active" | "cancelled" | "completed";
  paymentStatus: "pending" | "succeeded" | "failed" | "canceled";
  paymentIntentId?: string;
};

type BookingContextType = {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  fetchBookings: () => Promise<void>;
  createBooking: (data: Omit<Booking, "_id" | "paymentStatus" | "paymentIntentId">) => Promise<void>;
  completeBookingPayment: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export default BookingContext;
