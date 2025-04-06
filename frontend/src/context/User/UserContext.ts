import { createContext } from "react";

type Preferences = {
  sports: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  timeOfDay: string[];
  location: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  token: string;
  role: "user" | "venue_owner"; 
  preferences?: Preferences; 
};


type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default UserContext;
