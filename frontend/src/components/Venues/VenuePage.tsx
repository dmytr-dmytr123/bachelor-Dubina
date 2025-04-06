import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useAxios from "@/hooks/useAxios";
import useVenue from "@/context/Venues/VenueHook";

const VenuePage = () => {
  const { venueId } = useParams();
  const axios = useAxios();
  const { deleteVenue } = useVenue();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/venues/${venueId}`);
        setVenue(res.data);

        const user = JSON.parse(localStorage.getItem("user"));
        if (user && res.data.owner._id === user._id) {
          setIsOwner(true);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load venue details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const handleDelete = async () => {
    try {
      await deleteVenue(venueId);
      toast({
        title: "Venue Deleted",
        description: "The venue has been successfully removed.",
      });
      navigate("/venues");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.msg?.desc || "Failed to delete venue.",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        <Skeleton className="w-full h-40 rounded-lg" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle>{venue.name}</CardTitle>
          <CardDescription>{venue.location.city}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <div>
            <Label>Description:</Label>
            <p>{venue.description || "No description provided."}</p>
          </div>
          <div>
            <Label>Address:</Label>
            <p>{venue.location.address}</p>
          </div>
          <div>
            <Label>Sports:</Label>
            <p>{venue.sports.join(", ")}</p>
          </div>
          <div>
            <Label>Price per hour:</Label>
            <p>{venue.pricingPerHour} ₴</p>
          </div>
          <div>
            <Label>Availability:</Label>
            {venue.availability.map((slot, index) => (
              <div key={index} className="mt-2">
                <p>{`${slot.day}: ${slot.startTime} - ${slot.endTime}`}</p>
                {slot.timeSlots && slot.timeSlots.length > 0 && (
                  <div className="pl-4">
                    <Label>Time Slots:</Label>
                    <ul className="list-disc ml-4">
                      {slot.timeSlots.map((time, idx) => (
                        <li key={idx}>{time}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <Label>Owner:</Label>
            <p>
              {venue.owner.name} ({venue.owner.email})
            </p>
          </div>
        </CardContent>
        {isOwner && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/venues/${venue._id}/edit`)}
            >
              Edit Venue
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Venue
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VenuePage;
