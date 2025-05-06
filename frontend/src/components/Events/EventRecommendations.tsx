import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import useUser from "@/context/User/UserHook";

export type RecommendedEvent = {
  _id: string;
  title: string;
  sportType: string;
  skillLevel: string;
  date?: string;
  time?: string;
  venue?: {
    name: string;
    location: {
      address: string;
      city: string;
    };
  };
  maxParticipants?: number;
  participants?: any[];
  description?: string;
};

const EventRecommendations = () => {
  const [recommendations, setRecommendations] = useState<
    RecommendedEvent[] | null
  >(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const axios = useAxios();

  const { user } = useUser();
  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      try {
        console.log("Fetching recommendations...");
        const res = await axios.get("/events/recs");

        if (
          res.data?.recommendations &&
          Array.isArray(res.data.recommendations)
        ) {
          console.log("Got recommendations:", res.data.recommendations);
          setRecommendations(res.data.recommendations);
        } else {
          setRecommendations([]);
          console.warn("No recommendations or not an array");
        }
      } catch (error) {
        console.error("Failed to load recommendations", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch recommended events.",
        });
        setRecommendations([]);
      }
    };
    console.log("EREC", recommendations);
    fetchRecommendations();
  }, [toast, user]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Recommended Events</h2>

      {recommendations === null ? (
        <p className="text-muted-foreground text-center">
          Loading recommendations...
        </p>
      ) : recommendations.length === 0 ? (
        <p className="text-muted-foreground text-center">
          No recommendations available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      
          {recommendations.map(({ event, score }) => (
            <Card key={event._id} className="shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>{event.title || "—"}</CardTitle>
                <CardDescription>
                  {event.sportType || "Unknown"} –{" "}
                  {(event.skillLevel || "Unknown").toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {event.description || "No description available."}
                </p>
                <div className="mt-4 space-y-1">
                  <Label>📍 Location:</Label>
                  <p>
                    {event.location || "Unknown"} (
                    {event.venue?.name || "Venue"})
                  </p>

                  <Label>Date & Time:</Label>
                  <p>
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Unknown"}{" "}
                    at {event.time || "Unknown"}
                  </p>

                  <Label>👥 Participants:</Label>
                  <p>
                    {event.participants?.length || 0} /{" "}
                    {event.maxParticipants ?? "?"}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  View Event
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventRecommendations;
