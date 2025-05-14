import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const sportOptions = ["All", "Football", "Tennis", "Basketball", "Swimming"];
const locationOptions = ["All", "Lviv", "Kyiv", "Dnipro"];

const EventFilter = ({ onFilter }) => {
  const [sportType, setSportType] = useState("All");
  const [location, setLocation] = useState("All");
  const [minParticipants, setMinParticipants] = useState("");

  useEffect(() => {
    onFilter({
      sportType,
      location,
      minParticipants: parseInt(minParticipants) || 0,
    });
  }, [sportType, location, minParticipants]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">🔎 Filter Events</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <Label>Sport Type</Label>
          <Select value={sportType} onValueChange={setSportType}>
            <SelectTrigger className="w-full">
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

        <div className="flex flex-col gap-1">
          <Label>Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Min Participants</Label>
          <Input
            type="number"
            value={minParticipants}
            onChange={(e) => setMinParticipants(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
