import { useEffect } from "react";
import useVenue from "@/context/Venues/VenueHook";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const MyVenues = () => {
  const { venues, fetchMyVenues } = useVenue();
  const { toast } = useToast();
  const navigate = useNavigate();
  const loading = venues.length === 0;

  useEffect(() => {
    fetchMyVenues().catch(() =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your venues.",
      })
    );
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        <Skeleton className="w-full h-32 rounded-lg" />
        <Skeleton className="w-full h-32 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4">
      <h2 className="text-2xl font-semibold text-center">My Venues</h2>

      {venues.length === 0 ? (
        <p className="text-center text-gray-500">You haven't added any venues yet.</p>
      ) : (
        venues.map((venue) => (
          <Card key={venue._id} className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle>{venue.name}</CardTitle>
              <CardDescription>{venue.location.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-600">
              <p>{venue.description || "No description available."}</p>
              <div>
                <Label>Address:</Label>
                <p>{venue.location.address}</p>
              </div>
              <div>
                <Label>Sports:</Label>
                <p>{venue.sports.join(", ")}</p>
              </div>
              <div>
                <Label>Price/hour:</Label>
                <p>{venue.pricingPerHour} ₴</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button onClick={() => navigate(`/venues/${venue._id}`)}>View</Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default MyVenues;
