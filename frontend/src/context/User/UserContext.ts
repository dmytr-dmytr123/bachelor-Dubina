import { createContext } from "react";

type Preferences = {
  sports: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  timeOfDay: string[];
  location: string;
  gender: string[];
  age: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  token: string;
  role: "user" | "venue_owner";
  balance: number;
  preferences?: Preferences; 
};


type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  refreshUserBalance: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default UserContext;
