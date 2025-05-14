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
  const sportImages = {
    Football:
      "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
    Tennis:
      "https://images.pexels.com/photos/270197/pexels-photo-270197.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
    Basketball:
      "https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
    Running:
      "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
    Swimming:
      "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
    Cycling:
      "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  };

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
          {recommendations.map((event ) => (
            <Card
              key={event._id}
              className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {event.title || "—"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {event.sportType} •{" "}
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-200 text-xs font-semibold">
                        {(event.skillLevel || "Unknown").toUpperCase()}
                      </span>
                    </CardDescription>
                  </div>
                  <span className="text-xs text-gray-500">
                    ⭐ {event.score.toFixed(2)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-gray-700 space-y-2 pt-1">
                <img
                  src={sportImages[event.sportType] || ""}
                  alt={event.sportType}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <div>
                  <Label className="text-xs text-muted-foreground">
                    📍 Location
                  </Label>
                  <p>
                    {event.location || "Unknown"}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({event.venue?.name || "Venue"})
                    </span>
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    🗓️ Date & Time
                  </Label>
                  <p>
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Unknown"}{" "}
                    at {event.time || "Unknown"}
                  </p>
                </div>

              
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  size="sm"
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
