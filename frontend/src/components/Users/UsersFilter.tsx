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

const sportOptions = ["All", "Football", "Basketball", "Running"];
const levelOptions = ["All", "beginner", "intermediate", "advanced"];
const timeOptions = ["All", "morning", "day", "evening"];
const locationOptions = ["All", "Lviv", "Kyiv", "Dnipro"];

const UsersFilter = ({ onFilter }) => {
  const [sport, setSport] = useState("All");
  const [level, setLevel] = useState("All");
  const [time, setTime] = useState("All");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    onFilter({ sport, level, time, location, search });
  }, [sport, level, time, location, search]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold mb-4">🔎 Filter Users</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <Label>Sport</Label>
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {sportOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Skill Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Time of Day</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lviv"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
          />
        </div>
      </div>
    </div>
  );
};

export default UsersFilter;