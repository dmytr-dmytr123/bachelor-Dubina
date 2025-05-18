import { useEffect } from "react";
import useBooking from "@/context/Booking/BookingHook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDays, Clock, XCircle } from "lucide-react";

const MyBookings = () => {
  const { fetchMyBookings, bookings, cancelBooking } = useBooking();
  const { toast } = useToast();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    fetchMyBookings();
  };

  if (!bookings.length) {
    return (
      <p className="text-center mt-10 text-muted-foreground text-lg">
        No bookings found.
      </p>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-600 border border-red-200";
      case "completed":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      default:
        return "bg-green-100 text-green-600 border border-green-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bookings.map((booking) => {
          const isCancelled = booking.status === "cancelled";
          const isCompleted = booking.status === "completed";

          return (
            <Card
              key={booking._id}
              className="relative shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <CardHeader>
                <CardTitle className="text-lg truncate">
                  {booking.venue?.name || "Venue"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(booking.slot.start).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(booking.slot.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(booking.slot.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {!isCancelled && !isCompleted && (
                  <div className="pt-2 text-right">
                    <Button
                      onClick={() => handleCancel(booking._id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1 ml-auto"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
