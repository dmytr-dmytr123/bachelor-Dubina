import { useContext } from "react";
import BookingContext from "./BookingContext";

const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export default useBooking;
