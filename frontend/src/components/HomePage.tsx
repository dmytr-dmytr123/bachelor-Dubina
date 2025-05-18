import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white text-center py-4 mt-10">
      <div className="container mx-auto text-sm">
        &copy; {new Date().getFullYear()} <span className="text-green-500 font-semibold">SPORTEV</span>. All rights reserved.
      </div>
    </footer>
  );
};
const MainPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Find Local Events",
      desc: "Quickly find nearby  activities that fit to your interests and skills.",
      icon: "⚽",
    },
    {
      title: "Book Venues Easily",
      desc: "Reserve sports fields in a few clicks - no phone calls, no double bookings.",
      icon: "🏟️",
    },
    {
      title: "Join a Community",
      desc: "Meet like-minded people, create events together, or join with friends.",
      icon: "🤝",
    },
  ];

  const faqs = [
    {
      question: "Is SPORTEV free to use?",
      answer:
        "Yes, SPORTEV is completely free for users looking to join or create events. You may only pay for venue booking.",
    },
    {
      question: "How can I join an event?",
      answer:
        "Simply browse the events list, select an event that fits your preferences, you may View it and Join.",
    },
    {
      question: "Can I book a venue through SPORTEV?",
      answer:
        "Yes, You can book a venue when creating an event",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="relative h-[90vh] w-full overflow-hidden">
        <img
          src="https://images.pexels.com/photos/30666144/pexels-photo-30666144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="Football players"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/30 z-10 backdrop-blur-sm" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-white text-5xl md:text-6xl font-extrabold drop-shadow-xl">
            Welcome to <span className="text-green-500">SPORTEV</span>
          </h1>
          <p className="text-white text-lg md:text-xl mt-4 max-w-2xl drop-shadow-md">
            Discover and organize local sports events. Whether you're an athlete or a venue owner — SPORTEV connects you to your sports community.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            <Button
              onClick={() => navigate("/events")}
              className="px-6 py-3 text-lg font-semibold shadow-md bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
            >
              Browse Events
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="px-6 py-3 text-lg font-semibold text-white border border-white hover:bg-white/10 hover:backdrop-blur-md transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 md:px-16 bg-white -mt-12 z-30 relative">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
            Why <span className="text-green-500">SPORTEV</span>?
          </h2>
          <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
            We help connect players, organize events, and support venue owners – all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-white/80 border border-gray-200 backdrop-blur-md shadow-md hover:shadow-xl transition duration-300 rounded-2xl p-6"
              >
                <CardContent className="flex flex-col items-center text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 px-6 md:px-16 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
            FAQ
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="transition-shadow border border-gray-200 hover:shadow-lg"
              >
                <CardContent
                  className="p-6 cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">
                      {faq.question}
                    </h3>
                    <span className="text-2xl text-gray-400">
                      {openIndex === index ? "−" : "+"}
                    </span>
                  </div>
                  {openIndex === index && (
                    <p className="mt-4 text-gray-600">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
     <Footer />
     </>
  );
};

export default MainPage;
