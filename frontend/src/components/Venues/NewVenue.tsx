import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import useVenue from "@/context/Venues/VenueHook";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const NewVenue = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createVenue } = useVenue();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [pricingPerHour, setPricingPerHour] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  //getavailable days that haven't been selected yet
  const getAvailableDays = () => {
    const selectedDays = availability.map((slot) => slot.day);
    return weekDays.filter((day) => !selectedDays.includes(day));
  };

  //add availability slot with a default available day
  const addAvailability = () => {
    const availableDays = getAvailableDays();
    if (availableDays.length === 0) {
      toast({
        variant: "destructive",
        title: "No Available Days",
        description: "All days are already selected.",
      });
      return;
    }
    setAvailability([
      ...availability,
      { day: availableDays[0], startTime: "", endTime: "" },
    ]);
  };


  const handleAvailabilityChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = [...availability];
    updated.splice(index, 1);
    setAvailability(updated);
  };

  const handleCreate = async () => {
    if (
      !name ||
      !address ||
      !city ||
      sports.length === 0 ||
      !pricingPerHour ||
      availability.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      setLoading(true);
      const newVenue = await createVenue({
        name,
        description,
        location: { address, city },
        sports,
        availability,
        pricingPerHour,
        images,
      });

      console.log("Created Venue:", newVenue);

      toast({
        title: "Venue Created",
        description: "Your venue was successfully added.",
      });
      navigate("/venues");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create venue.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Venue</CardTitle>
          <CardDescription>
            Fill in the details of your sports facility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Venue Name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, Building No."
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City name"
            />
          </div>
          <div>
            <Label>Sports</Label>
            <Input
              placeholder="Separate sports with comma"
              value={sports.join(", ")}
              onChange={(e) =>
                setSports(e.target.value.split(",").map((s) => s.trim()))
              }
            />
          </div>
          <div>
            <Label>Availability</Label>
            {availability.map((slot, index) => (
              <div key={index} className="space-y-1 flex gap-2 items-center">
                <select
                  value={slot.day}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "day", e.target.value)
                  }
                  className="border rounded p-1"
                >
                  {weekDays.map((day) => (
                    <option
                      key={day}
                      value={day}
                      disabled={availability.some((a) => a.day === day)}
                    >
                      {day}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "startTime", e.target.value)
                  }
                />
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "endTime", e.target.value)
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveSlot(index)}
                  className="p-1"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button onClick={addAvailability} className="mt-2">
              Add Time Slot
            </Button>
          </div>
          <div>
            <Label>Price per Hour (₴)</Label>
            <Input
              type="number"
              value={pricingPerHour}
              onChange={(e) => setPricingPerHour(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Venue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewVenue;
