import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEvent from "@/context/User/Events/EventHook";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAxios from "@/hooks/useAxios";
import { useToast } from "@/components/ui/use-toast";
import EventsRecommendations from "./EventRecommendations.tsx";
import EventFilter from "./EventFilter.tsx";

const sportImages = {
  Football: "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  Tennis: "https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  Basketball: "https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  Running: "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  Swimming: "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
  Cycling: "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
};

const EventsList = () => {
  const { events, fetchEvents } = useEvent();
  const axios = useAxios();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setFilteredEvents(events);
      setCurrentPage(1);
    }
  }, [events]);

  const handleFilter = (filters) => {
    const { sportType, location, minParticipants } = filters;

    const filtered = events.filter((event) => {
      const sportMatch = sportType === "All" || event.sportType === sportType;
      const locationMatch =
        location === "All" || event.venue?.location?.city === location;
      const participantMatch = event.participants.length >= minParticipants;

      return sportMatch && locationMatch && participantMatch;
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-6 px-4">
      <EventsRecommendations />

      <h2 className="text-3xl font-bold text-center text-gray-800">
        🏆 Upcoming Sports Events
      </h2>

      <EventFilter onFilter={handleFilter} />

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => (
              <Card
                key={event._id}
                className="border border-gray-100 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={sportImages[event.sportType] || sportImages.Football}
                  alt={event.sportType}
                  className="w-full h-40 object-cover rounded-t-2xl"
                />
                <CardHeader className="pb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-0.5">
                        {event.sportType}
                      </CardDescription>
                    </div>
                    <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full uppercase font-medium">
                      {event.skillLevel}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-3 pt-1">
                  <p className="text-gray-600">
                    {event.description || "No description available."}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📍</span>
                    <span>
                      {event.venue?.location?.city || "Unknown location"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">🗓</span>
                    <span>
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">👥</span>
                    <span>
                      {event.participants.length} / {event.maxParticipants}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="w-full text-sm font-medium"
                  >
                    View Event
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsList;
