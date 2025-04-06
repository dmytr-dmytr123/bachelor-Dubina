import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Auth from "@/components/Auth.tsx";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { VerificationForm } from "@/components/Auth/VerificationForm";
import { Toaster } from "@/components/ui/toaster";
import PrivateRoute from "@/components/PrivateRoute";
import VerifiedRoute from "@/components/VerifiedRoute";
import ProtectedComp from "@/components/ProtectedComp";
import EventsList from "@/components/Events/EventsList";
import NewEvent from "@/components/Events/NewEvent.tsx";
import EventPage from "@/components/Events/EventPage";
import VenuesList from "@/components/Venues/VenuesList";
import MyVenues from "@/components/Venues/MyVenues";
import NewVenue from "@/components/Venues/NewVenue";
import VenuePage from "@/components/Venues/VenuePage";
import EditVenue from "@/components/Venues/EditVenue";
import HomePage from "@/components/HomePage";

import ChangeEmailVerification from "@/components/Auth/ChangeEmailVerification";
import ForgetPwd from "@/components/Auth/ForgetPwd";
import ResetPwd from "@/components/Auth/ResetPwd";
import { useEffect } from "react";
import useUser from "@/context/User/UserHook";

function App() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const currentPath = window.location.pathname;

    if (user.isVerified && currentPath === "/") {
      navigate("/home");
    }

    if (!user.isVerified && currentPath !== "/verify") {
      navigate("/verify");
    }
  }, [navigate, user]);

  return (
    <>
      {" "}
      <Header />
      <Routes>
        <Route path="/password/verify/:email/:token" element={<ResetPwd />} />
        <Route path="/password/forget" element={<ForgetPwd />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/" element={<Auth />} />
        <Route element={<PrivateRoute />}>
          <Route path="/verify" element={<VerificationForm />} />
          <Route element={<VerifiedRoute />}>
            <Route
              path="/email/verify/:token"
              element={<ChangeEmailVerification />}
            />
            <Route path="/home1" element={<ProtectedComp />} />

            <Route path="/events" element={<EventsList />} />
            <Route path="/create-event" element={<NewEvent />} />
            <Route path="/events/:eventId" element={<EventPage />} />
            <Route path="/venues" element={<VenuesList />} />
            <Route path="/my-venues" element={<MyVenues />} />
            <Route path="/venues/:venueId" element={<VenuePage />} />
            <Route path="/venues/:venueId/edit" element={<EditVenue />} />
            <Route path="/create-venue" element={<NewVenue />} />
          </Route>
        </Route>
      </Routes>
      <Footer/>
      <Toaster />
    </>
  );
}

export default App;
