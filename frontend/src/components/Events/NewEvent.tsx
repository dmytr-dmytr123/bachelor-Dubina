import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import useVenue from "@/context/Venues/VenueHook";
import VenueBooking from "./VenueBooking";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

console.log("Stripe Public Key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const sportOptions = [
  "Football",
  "Tennis",
  "Basketball",
  "Running",
  "Swimming",
  "Cycling",
];
const skillLevels = ["beginner", "intermediate", "advanced"];

const NewEvent = () => {
  const { createEvent } = useEvent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchVenues } = useVenue();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sportType, setSportType] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleCreate = async () => {
    console.log("Creating event with the following details:");
    if (
      !title ||
      !sportType ||
      !skillLevel ||
      !maxParticipants ||
      !bookingDetails
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Fill all fields.",
      });
      return;
    }

    try {
      setLoading(true);
      const eventTime = new Date(bookingDetails.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const response = await createEvent({
        title,
        description,
        sportType,
        skillLevel,
        date: bookingDetails.start,
        time: eventTime,
        maxParticipants,
        venueId: bookingDetails.venueId,
        slot: {
          start: bookingDetails.start,
          end: bookingDetails.end,
        },
        amount: 100,
      });

      if (response?.msg?.title === "Event Created") {
        toast({ title: response.msg.title, description: response.msg.desc });

        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
          toast({
            title: "Proceed to Payment",
            description: "Complete your payment.",
          });
        } else {
          navigate("/events");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unexpected response from server.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event.",
      });
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Card className="p-6 shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Create a new event</CardTitle>
          <CardDescription className="text-muted-foreground">
            Fill out the form with event info and book a venue.
          </CardDescription>
        </CardHeader>
  
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
  
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                placeholder="Event Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
  
            <div>
              <Label>Sport type</Label>
              <Select onValueChange={setSportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportOptions.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div>
              <Label>Skill level</Label>
              <Select onValueChange={setSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div>
              <Label>Max participants</Label>
              <Input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              />
            </div>
          </div>
  
          <div className="mt-8">
            <VenueBooking onBooking={(details) => setBookingDetails(details)} />
          </div>
  
          {clientSecret ? (
            <div className="mt-8">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    toast({
                      title: "Payment Successful",
                      description: "Event booked successfully!",
                    });
                    navigate("/events");
                  }}
                />
              </Elements>
            </div>
          ) : (
            <div className="mt-8 flex justify-end">
              <Button onClick={handleCreate} disabled={loading} className="px-6 py-2">
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
};

export default NewEvent;
