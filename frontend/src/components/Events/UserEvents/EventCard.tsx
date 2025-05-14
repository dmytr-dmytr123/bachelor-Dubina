import { useNavigate } from "react-router-dom";

const EventCard = ({ event }: { event: any }) => {
  const navigate = useNavigate();

  return (
    <div className="border p-4 rounded-lg shadow space-y-2">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-sm text-muted-foreground">
        {event.date} at {event.time}
      </p>
      <p className="text-sm">{event.sportType}</p>
      {event.venue && (
        <p className="text-sm text-muted-foreground">
          {event.venue.name}, {event.venue.location.city}
        </p>
      )}

      <div className="pt-2">
        <button
          onClick={() => navigate(`/events/${event._id}`)}
          className="text-sm text-blue-600 hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
