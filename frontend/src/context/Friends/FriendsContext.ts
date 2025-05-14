import { createContext } from "react";

export type FriendUser = {
  _id: string;
  name: string;
  email: string;
  preferences?: {
    sports: string[];
    skillLevel: string;
    timeOfDay: string[];
    location: string;
  };
};

type FriendsContextType = {
  friends: FriendUser[];
  requests: FriendUser[];
  sentRequests: string[];
  fetchAllFriendsData: () => Promise<void>;
  acceptRequest: (userId: string) => Promise<void>;
  rejectRequest: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  sendRequest: (userId: string) => Promise<void>;
  cancelRequest: (userId: string) => Promise<void>;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export default FriendsContext;
