import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useVenue from "@/context/Venues/VenueHook";
import SelectVenueModal from "./SelectVenueModal";
import useAxios from "@/hooks/useAxios";
import useBooking from "@/context/Booking/BookingHook";
import {
  generateNextWeekDates,
  getValidSlots,
  buildBookingDetails,
} from "@/utils/bookingUtils";

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

          const nextWeekDates = generateNextWeekDates();
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

      const validSlots = getValidSlots(dayAvailability.timeSlots, date);
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
    const details = buildBookingDetails(time, selectedDay, selectedVenueId);
    onBooking(details);
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
              .sort()
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