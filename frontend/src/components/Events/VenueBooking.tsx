import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useVenue from "@/context/Venues/VenueHook";
import SelectVenueModal from "./SelectVenueModal";
import useAxios from "@/hooks/useAxios";
import useBooking from "@/context/Booking/BookingHook";

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
  const { fetchAvailability } = useVenue();
  const { toast } = useToast();
  const { getBookedSlots } = useBooking();

  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState("");
  const [availableDates, setAvailableDates] = useState<
    { label: string; value: string; day: string }[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const axios = useAxios();

  useEffect(() => {
    if (selectedVenueId) {
      fetchAvailability(selectedVenueId)
        .then((availability) => {
          if (!availability || !Array.isArray(availability)) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Invalid availability data from server.",
            });
            return;
          }

          const today = new Date();
          const nextWeekDates = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            }); //mon,tue
            const formatted = date.toISOString().split("T")[0]; //yyyy-mm-dd
            const label = `${String(date.getDate()).padStart(2, "0")}.${String(
              date.getMonth() + 1
            ).padStart(2, "0")} (${dayName})`;
            return { label, value: formatted, day: dayName };
          });

          const availableDayNames = availability.map((slot: any) => slot.day);
          const filtered = nextWeekDates.filter((d) =>
            availableDayNames.includes(d.day)
          );
          setAvailableDates(filtered);
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to fetch availability: ${error.message}`,
          });
        });
    }
  }, [selectedVenueId]);

  const handleDaySelect = async (date: string, day: string) => {
    setSelectedDay(date);
    setSelectedTimes([]);
  
    try {
      const availability = await fetchAvailability(selectedVenueId);
      const dayAvailability = availability.find(
        (slot: { day: string }) => slot.day === day
      );
  
      if (!dayAvailability) {
        setBookedSlots([]);
        setTimeSlots([]);
        return;
      }
  
      const now = new Date();
      let validSlots = dayAvailability.timeSlots || [];
  
      const selectedDateObj = new Date(date);
      const isToday =
        now.toISOString().split("T")[0] ===
        selectedDateObj.toISOString().split("T")[0];
  
      if (isToday) {
        validSlots = validSlots.filter((time: string) => {
          const [start] = time.split("-");
          const slotDate = new Date(`${date}T${start}:00`);
          return slotDate > now;
        });
      }
  
      const booked = await getBookedSlots(selectedVenueId, date);
      setBookedSlots(booked);
      setTimeSlots(validSlots);
  
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch time slots: ${error.message}`,
      });
    }
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTimes([time]);

    const [start, end] = time.split("-");
    const startDateTime = new Date(`${selectedDay}T${start}:00`).toISOString();
    const endDateTime = new Date(`${selectedDay}T${end}:00`).toISOString();

    const bookingDetails: BookingDetails = {
      venueId: selectedVenueId,
      start: startDateTime,
      end: endDateTime,
      status: "pending",
    };

    onBooking(bookingDetails);
  };

  return (
    <div className="mt-4 space-y-4">
      <Label className="text-lg font-semibold">Select venue</Label>
     
      <SelectVenueModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(venueId) => {
          setSelectedVenueId(venueId);
          setShowModal(false);
        }}
      />

      {selectedVenueId && availableDates.length > 0 && (
        <div className="mt-4">
          <Label className="text-lg font-semibold">Select day</Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableDates.map(({ label, value, day }) => (
              <Button
                key={value}
                variant={selectedDay === value ? "solid" : "outline"}
                onClick={() => handleDaySelect(value, day)}
              >
                {label}
              </Button>
            ))}
          </div>

          <Label className="text-lg font-semibold">Select time</Label>
          <div className="flex flex-wrap gap-2">
            {timeSlots
              .filter((time) => !bookedSlots.includes(time))
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
