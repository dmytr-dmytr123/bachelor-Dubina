import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useVenue from "@/context/Venues/VenueHook";
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

const VenuesList = () => {
  const { venues, fetchVenues } = useVenue();
  const { toast } = useToast();
  const navigate = useNavigate();
  const loading = venues.length === 0;

  useEffect(() => {
    fetchVenues().catch(() =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch venues.",
      })
    );
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {[...Array(4)].map((_, idx) => (
          <Skeleton key={idx} className="w-full h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        🏟 Available Sports Venues
      </h2>

      {venues.length === 0 ? (
        <p className="text-center text-gray-500">No venues available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {venues.map((venue) => (
            <Card
              key={venue._id}
              className="rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition duration-300 bg-white"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{venue.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {venue.location.city}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-gray-700 space-y-2 pt-1">
                <p className="text-gray-600">
                  {venue.description || "No description available."}
                </p>
                <div>
                  <Label className="text-gray-500">📍 Address</Label>
                  <p>{venue.location.address}</p>
                </div>
                <div>
                  <Label className="text-gray-500">🏅 Sports</Label>
                  <p>{venue.sports.join(", ")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">💸 Price/hour</Label>
                  <p>{venue.pricingPerHour} ₴</p>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  variant="default"
                  onClick={() => navigate(`/venues/${venue._id}`)}
                  className="w-full font-medium hover:scale-[1.02] transition"
                >
                  View Venue
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VenuesList;
