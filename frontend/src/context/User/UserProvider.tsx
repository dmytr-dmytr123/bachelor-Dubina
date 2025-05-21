import { useState } from "react";
import UserContext from "./UserContext";
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


const UserProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const logout = () => {
    if (user) {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const addUser = (value: User) => {
    localStorage.setItem("user", JSON.stringify(value));
    setUser(value);
  };
  
  return (
    <UserContext.Provider value={{ user, setUser: addUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
