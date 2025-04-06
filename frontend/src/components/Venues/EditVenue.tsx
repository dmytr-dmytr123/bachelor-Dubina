import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useVenue from "@/context/Venues/VenueHook";
import useAxios from "@/hooks/useAxios";

const EditVenue = () => {
  const { venueId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const axios = useAxios();
  const { updateVenue } = useVenue();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [pricingPerHour, setPricingPerHour] = useState(0);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/venues/${venueId}`);
        const data = res.data;
        setName(data.name);
        setDescription(data.description || "");
        setAddress(data.location.address);
        setCity(data.location.city);
        setSports(data.sports);
        setPricingPerHour(data.pricingPerHour);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load venue details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const handleUpdate = async () => {
    if (!name || !address || !city || sports.length === 0 || !pricingPerHour) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    try {
      setSubmitting(true);
      await updateVenue(venueId, {
        name,
        description,
        location: { address, city },
        sports,
        pricingPerHour,
      });
      toast({ title: "Venue Updated", description: "Your changes have been saved." });
      navigate(`/venues/${venueId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update venue.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading venue details...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Venue</CardTitle>
          <CardDescription>Update the details of your venue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Venue Name" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Building No." />
          </div>
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City name" />
          </div>
          <div>
            <Label>Sports</Label>
            <Input
              placeholder="Separate sports with comma"
              value={sports.join(", ")}
              onChange={(e) => setSports(e.target.value.split(",").map((s) => s.trim()))}
            />
          </div>
          <div>
            <Label>Price per Hour (₴)</Label>
            <Input type="number" value={pricingPerHour} onChange={(e) => setPricingPerHour(Number(e.target.value))} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleUpdate} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditVenue;
