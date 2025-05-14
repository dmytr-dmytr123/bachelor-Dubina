import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">SPORTEV</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover and organize local sports events with ease. Whether you're an athlete or a venue owner, SPORTEV helps you connect with your local sports community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={() => navigate("/events")}
            className="px-6 py-3 text-lg font-medium shadow-md"
          >
            Browse Events
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="px-6 py-3 text-lg font-medium border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg transition-all hover:shadow-2xl">
            <CardContent className="p-6 text-left">
              <h2 className="text-2xl font-semibold text-blue-600 flex items-center gap-2 mb-2">
                👥 For Users
              </h2>
              <p className="text-gray-700 mb-4">
                Discover tailored sports events. Filter by sport, level, and location. Connect with athletes and track your growth.
              </p>
              <Button variant="secondary" onClick={() => navigate("/events")}>
                Find Events
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all hover:shadow-2xl">
            <CardContent className="p-6 text-left">
              <h2 className="text-2xl font-semibold text-purple-600 flex items-center gap-2 mb-2">
                📍 For Venue Owners
              </h2>
              <p className="text-gray-700 mb-4">
                List your venue, accept bookings, and manage availability. Grow your visibility with the SPORTEV community.
              </p>
              <Button variant="secondary" onClick={() => navigate("/venues")}>
                Explore Venues
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          ⚡ Trusted by thousands of athletes & organizers
          <br />
          <span className="text-gray-700">Join today and stay active smarter 🚀</span>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
