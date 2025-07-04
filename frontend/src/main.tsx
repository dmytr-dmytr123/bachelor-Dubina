import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import UserProvider from "./context/User/UserProvider.tsx";
import EventProvider from "./context/User/Events/EventProvider.tsx";
import VenueProvider from "./context/Venues/VenueProvider.tsx";
import BookingProvider from "./context/Booking/BookingProvider.tsx";
import ChatProvider from "./context/Chat/ChatProvider.tsx";
import FriendsProvider from "@/context/Friends/FriendsProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <EventProvider>
          <VenueProvider>
          <BookingProvider>
          <ChatProvider>
          <FriendsProvider>

            <App />
            </FriendsProvider>

            </ChatProvider>
            </BookingProvider>
          </VenueProvider>
        </EventProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
