import { useState, useEffect } from "react";
import useVenue from "@/context/Venues/VenueHook";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios"; 

type BookingDetails = {
  venueId: string;
  start: string;
  end: string;
  status: string;
};

type VenueBookingProps = {
  onBooking: (details: BookingDetails) => void;
};

const VenueBooking = ({ onBooking }: VenueBookingProps) => {
  const { venues, fetchVenues, fetchAvailability } = useVenue();
  const { toast } = useToast();

  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  useEffect(() => {
    if (selectedVenue) {
      const venue = venues.find((v) => v._id === selectedVenue);
      if (venue?.availability) {
        const days = venue.availability.map((slot) => slot.day);
        setAvailableDays(days);
      }
    }
  }, [selectedVenue, venues]);

  useEffect(() => {
    if (selectedVenue && selectedDay) {
      fetchAvailability(selectedVenue)
        .then((availability) => {
          if (!availability || !Array.isArray(availability)) {
            console.error("Invalid availability data structure:", availability);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Invalid availability data from server.",
            });
            return;
          }

          const selectedDayAvailability = availability.find(
            (slot: { day: string }) => slot.day === selectedDay
          );

          if (selectedDayAvailability) {
            setBookedSlots(
              selectedDayAvailability.bookedSlots?.map(
                (slot: any) => slot.slot
              ) || []
            );
            setTimeSlots(selectedDayAvailability.timeSlots || []);
          } else {
            setBookedSlots([]);
            setTimeSlots([]);
          }
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to fetch booked slots: ${error.message}`,
          });
          console.error("Error fetching booked slots:", error);
        });
    }
  }, [selectedVenue, selectedDay, fetchAvailability, toast]);

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setSelectedTimes([]);
    const venue = venues.find((v) => v._id === selectedVenue);
    const availability = venue?.availability.find((slot) => slot.day === day);
    setTimeSlots(availability?.timeSlots || []);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimes([time]);

    const [start, end] = time.split("-");
    const bookingDate = new Date().toISOString().split("T")[0];
    const startDateTime = new Date(`${bookingDate}T${start}:00`).toISOString();
    const endDateTime = new Date(`${bookingDate}T${end}:00`).toISOString();

    const bookingDetails = {
      venueId: selectedVenue,
      start: startDateTime,
      end: endDateTime,
      status: "pending",
    };

    onBooking(bookingDetails);
  };

  const totalPages = Math.ceil(venues.length / itemsPerPage);
  const currentVenues = venues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <Label className="text-lg font-semibold">Select Venue</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {currentVenues.map((venue) => (
          <Card
            key={venue._id}
            className={`p-4 transition-transform transform hover:scale-105 ${
              selectedVenue === venue._id
                ? "border-blue-500"
                : "border-gray-300"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold">{venue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Location: {venue.location?.address}, {venue.location?.city}
              </p>
              <p>Sports: {venue.sports.join(", ")}</p>
              {venue.description && <p>Description: {venue.description}</p>}
            </CardContent>
            <CardFooter>
              <Button
                variant={selectedVenue === venue._id ? "solid" : "outline"}
                onClick={() => setSelectedVenue(venue._id)}
                className="w-full"
              >
                {selectedVenue === venue._id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {selectedVenue && availableDays.length > 0 && (
        <div className="mt-4">
          <Label className="text-lg font-semibold">Select Day</Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableDays.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "solid" : "outline"}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <Label className="text-lg font-semibold">Select Time</Label>
          <div className="flex flex-wrap gap-2">
            {timeSlots
              .filter((time) => !bookedSlots.includes(time))//excluding booked slots
              .map((time) => (
                <Button
                  key={time}
                  variant={selectedTimes.includes(time) ? "solid" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueBooking;
