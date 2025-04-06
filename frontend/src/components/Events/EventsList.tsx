import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEvent from "@/context/User/Events/EventHook";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useAxios from "@/hooks/useAxios";
import { useToast } from "@/components/ui/use-toast";

const EventsList = () => {
  const { events, fetchEvents } = useEvent();
  const axios = useAxios();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    console.log(events);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4">
      <h2 className="text-2xl font-semibold text-center">🏆 Upcoming Sports Events</h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event._id} className="shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.sportType} - {event.skillLevel.toUpperCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{event.description || "No description available."}</p>
                <div className="mt-4 space-y-1">
                  <Label>📍 Location:</Label>
                  <p>{event.customLocation}</p>

                  <Label>Date & Time:</Label>
                  <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>

                  <Label>👥 Participants:</Label>
                  <p>{event.participants.length} / {event.maxParticipants}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate(`/events/${event._id}`)}>
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

export default EventsList;
