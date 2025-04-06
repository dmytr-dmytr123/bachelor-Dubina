import { useContext } from "react";
import VenueContext from "./VenueContext";

const useVenue = () => {
  const context = useContext(VenueContext);
  if (context === undefined)
    throw new Error("VenueContext is being used outside the scope");
  return context;
};

export default useVenue;
