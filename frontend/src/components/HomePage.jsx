import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">SPORTEV</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          SPORTEV is your ultimate platform for organizing and discovering local sports events. Whether you're a passionate player or a venue owner, we've got the tools you need.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => navigate("/events")} className="text-lg px-6 py-3">
            Browse Events
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="text-lg px-6 py-3">
            Get Started
          </Button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">For Users</h2>
            <p className="text-gray-600 mb-4">
              Join exciting sports events, meet new people, and track your participation. Tailor your preferences by sport type, skill level, and availability.
            </p>
            <Button onClick={() => navigate("/events")} variant="secondary">Find Events</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">For Venue Owners</h2>
            <p className="text-gray-600 mb-4">
              List your venue, manage bookings, and connect with event organizers. Showcase your space to a growing community of athletes.
            </p>
            <Button onClick={() => navigate("/venues")} variant="secondary">Explore Venues</Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default MainPage;