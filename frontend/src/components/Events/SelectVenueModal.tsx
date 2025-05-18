import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import useVenue from "@/context/Venues/VenueHook";

type Props = {
  onSelect: (venueId: string) => void;
};

const SelectVenueModal = ({ onSelect }: Props) => {
  const { venues, fetchVenues } = useVenue();
  const [open, setOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);

  const venueImage =
    "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSelect = (venue: any) => {
    onSelect(venue._id);
    setSelectedVenue(venue);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {selectedVenue ? (
        <div className="border border-gray-300 rounded-xl p-4 flex items-start justify-between gap-4 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={venueImage}
              alt={selectedVenue.name}
              className="w-28 h-20 object-cover rounded-md border"
            />
            <div>
              <h4 className="font-semibold text-base">{selectedVenue.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedVenue.location?.address}, {selectedVenue.location?.city}
              </p>
              <p className="text-sm text-muted-foreground">
                Sports: {selectedVenue.sports.join(", ")}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Change
          </Button>
        </div>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Select Venue</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Venue</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-2">
          {Array.isArray(venues) && venues.length > 0 ? (
            venues.map((venue) => (
              <Card
                key={venue._id}
                className="border border-gray-300 hover:border-blue-500 transition duration-200 shadow-md hover:shadow-lg flex flex-col"
              >
                <img
                  src={venueImage}
                  alt={`${venue.name} image`}
                  className="w-full h-40 object-cover rounded-t"
                />
                <CardHeader>
                  <CardTitle>{venue.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-sm text-muted-foreground">
                  <p>
                    {venue.location?.address}, {venue.location?.city}
                  </p>
                  <p>Sports: {venue.sports.join(", ")}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelect(venue)}>
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No venues found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectVenueModal;
