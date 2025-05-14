import { useContext } from "react";
import FriendsContext from "./FriendsContext";

const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) throw new Error("useFriends must be used within FriendsProvider");
  return context;
};

export default useFriends;
