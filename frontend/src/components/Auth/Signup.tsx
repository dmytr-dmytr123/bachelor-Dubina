import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "@/context/User/UserHook";
import useAxios from "@/hooks/useAxios";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import PwdInput from "@/components/Auth/PwdInput";
import { TabsContent } from "@/components/ui/tabs";

const sportsOptions = ["Football", "Tennis", "Basketball", "Running", "Swimming", "Cycling"];
const skillLevels = ["beginner", "intermediate", "advanced"];
const timeOfDayOptions = ["morning", "day", "evening"];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"user" | "venue_owner">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [match, setMatch] = useState(0);
  const [sports, setSports] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();
  const axios = useAxios();

  useEffect(() => {
    if (!pwd || !confirmPwd) {
      setMatch(0);
      return;
    }
    if (pwd.length < 4 || pwd !== confirmPwd) {
      setMatch(2);
    } else {
      setMatch(1);
    }
  }, [pwd, confirmPwd]);

  const handleNext = () => {
    if (step === 1 && match !== 1) return;

    if (role === "venue_owner" && step >= 2) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSportChange = (sport: string) => {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleTimeChange = (time: string) => {
    setTimeOfDay((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || match !== 1) return;

    const payload: any = {
      name,
      email,
      password: pwd,
      role,
    };

    if (role === "user") {
      if (!sports.length || !skillLevel || !timeOfDay.length || !location) {
        console.log("Missing user preferences");
        return;
      }
      payload.preferences = {
        sports,
        skillLevel,
        timeOfDay,
        location,
      };
    }

    try {
      setIsLoading(true);
      const res = await axios.post("/auth/register", payload);
      setUser(res.data.user);
      navigate("/home");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = role === "user" ? 5 : 2;

  return (
    <TabsContent value="signup">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Step {step} of {totalSteps}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <Label htmlFor="role">Account Type</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "venue_owner")}
                className="border p-2 rounded w-full"
              >
                <option value="user">I want to join sports events</option>
                <option value="venue_owner">I want to manage sports venues</option>
              </select>

              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />

              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />

              <PwdInput id="pwd" name="Password" pwd={pwd} setPwd={setPwd} match={match} />
              <PwdInput id="confirmPwd" name="Confirm Password" pwd={confirmPwd} setPwd={setConfirmPwd} match={match} />

              {match === 2 && <p className="text-red-500 text-sm">Passwords do not match.</p>}
            </>
          )}

          {role === "user" && step === 2 && (
            <>
              <Label>Select Your Favorite Sports</Label>
              <div className="grid grid-cols-2 gap-2">
                {sportsOptions.map((sport) => (
                  <label key={sport} className="flex items-center space-x-2">
                    <input type="checkbox" checked={sports.includes(sport)} onChange={() => handleSportChange(sport)} />
                    <span>{sport}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {role === "user" && step === 3 && (
            <>
              <Label>Select Your Skill Level</Label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Select skill level</option>
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </>
          )}

          {role === "user" && step === 4 && (
            <>
              <Label>Preferred Time of Day</Label>
              <div className="grid grid-cols-2 gap-2">
                {timeOfDayOptions.map((time) => (
                  <label key={time} className="flex items-center space-x-2">
                    <input type="checkbox" checked={timeOfDay.includes(time)} onChange={() => handleTimeChange(time)} />
                    <span>{time}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {role === "user" && step === 5 && (
            <>
              <Label>Location</Label>
              <Input type="text" placeholder="Your City" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={step === 1 && match !== 1}>
              Next
            </Button>
          ) : (
            <Button type="submit" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? <LoaderCircle className="spinner animate-spin" /> : "Finish Sign Up"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default Signup;
