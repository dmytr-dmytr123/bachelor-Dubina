import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import EventCard from "./EventCard";
import { Button } from "@/components/ui/button";
import useUser from "@/context/User/UserHook";
import { UserRound } from "lucide-react";

const PAGE_SIZE = 4;

const MyEvents = () => {
  const axios = useAxios();
  const { toast } = useToast();
  const { user } = useUser();

  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [createdPage, setCreatedPage] = useState(1);
  const [joinedPage, setJoinedPage] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [createdRes, joinedRes] = await Promise.all([
          axios.get("/events/my/created"),
          axios.get("/events/my/joined"),
        ]);
        setCreatedEvents(createdRes.data);
        setJoinedEvents(joinedRes.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load event data.",
        });
        console.error(error);
      }
    };

    if (user) fetchEvents();
  }, [user]);

  const paginate = (items: any[], page: number) =>
    items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!user)
    return <p className="text-center mt-10 text-xl">You are not logged in.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 shadow rounded-xl p-6 mb-10 border border-muted">
        <div className="flex items-center gap-4 mb-6">
          <UserRound className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><span className="font-semibold text-foreground">Name:</span> {user.name}</p>
            <p><span className="font-semibold text-foreground">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-foreground">Role:</span> {user.role}</p>
          </div>
          <div>
            <p><span className="font-semibold text-foreground">Sports:</span> {user.preferences?.sports?.join(", ")}</p>
            <p><span className="font-semibold text-foreground">Skill Level:</span> {user.preferences?.skillLevel}</p>
            <p><span className="font-semibold text-foreground">Location:</span> {user.preferences?.location}</p>
            <p><span className="font-semibold text-foreground">Preferred Time:</span> {user.preferences?.timeOfDay?.join(", ")}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="created" className="space-y-4">
        <TabsList className="w-full flex justify-center gap-2">
          <TabsTrigger value="created" className="px-6 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white">Created</TabsTrigger>
          <TabsTrigger value="joined" className="px-6 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white">Joined</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          {createdEvents.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {paginate(createdEvents, createdPage).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={createdPage === 1}
                  onClick={() => setCreatedPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={createdPage * PAGE_SIZE >= createdEvents.length}
                  onClick={() => setCreatedPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-6 text-center">No created events.</p>
          )}
        </TabsContent>

        <TabsContent value="joined">
          {joinedEvents.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {paginate(joinedEvents, joinedPage).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={joinedPage === 1}
                  onClick={() => setJoinedPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={joinedPage * PAGE_SIZE >= joinedEvents.length}
                  onClick={() => setJoinedPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-6 text-center">No joined events.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyEvents;
