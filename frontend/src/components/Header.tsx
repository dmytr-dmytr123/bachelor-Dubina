import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, CircleUser, Inbox, MessageSquare, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import InvitationsModal from "./InvitationsModal";
import useUser from "@/context/User/UserHook";
import EmailDialog from "@/components/Auth/EmailDialog";
import PasswordDialog from "@/components/Auth/PasswordDialog";
import { ModeToggle } from "./mode-toggle";
import useAxios from "../hooks/useAxios";

const Header = () => {
  const { user, logout } = useUser();
  const [emailDialog, setEmailDialog] = useState(false);
  const [pwdDialog, setPwdDialog] = useState(false);
  const navigate = useNavigate();
  const axios = useAxios();
  const handleLogout = () => {
    logout();
  };
  const isVenueOwner = user?.role === "venue_owner";
  const isUsualUser = user?.role === "user";

  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get("/auth/balance");
        console.log('res',res);
        setBalance(res.data.balance);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    if (user) fetchBalance();
  },);

  return (
    <header className="top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6 sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-green-500 text-lg font-semibold md:text-base"
        >
          SPORTEV
          <span className="sr-only">SPORTEV</span>
        </Link>

        <Link
          to="/"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>

        {isUsualUser && (
          <Link
            to="/events"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Events
          </Link>
        )}

        {isUsualUser && (
          <Link
            to="/venues"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Venues
          </Link>
        )}
        {isUsualUser && (
          <Link
            to="/users"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
        )}

        {isVenueOwner && (
          <Link
            to="/my-venues"
            className="text-foreground transition-colors hover:text-foreground"
          >
            My Venues
          </Link>
        )}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              SPORTEV
              <span className="sr-only">SPORTEV</span>
            </Link>
            <Link
              to="/"
              className="text-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>

            {!isVenueOwner && (
              <Link
                to="/events"
                className="text-foreground transition-colors hover:text-foreground"
              >
                Events
              </Link>
            )}

            {isVenueOwner && (
              <Link
                to="/my-venues"
                className="text-foreground transition-colors hover:text-foreground"
              >
                My Venues
              </Link>
            )}
            {user && (
              <>
                <Button
                  onClick={() =>
                    navigate(isVenueOwner ? "/create-venue" : "/create-event")
                  }
                  variant="default"
                >
                  {isVenueOwner ? "Create Venue" : "Create Event"}
                </Button>
              </>
            )}

            {user && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/friends")}
                >
                  <Users className="w-5 h-5" />
                  <span className="sr-only">Friends</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/chats")}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="sr-only">Chats</span>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Inbox className="w-5 h-5" />
                      <span className="sr-only">Invitations</span>
                    </Button>
                  </DialogTrigger>
                  <InvitationsModal />
                </Dialog>
              </>
            )}

            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <CircleUser className="h-5 w-5" />
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem asChild>
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setEmailDialog(true)}>
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPwdDialog(true)}>
                      Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog
                  open={emailDialog}
                  onOpenChange={() => setEmailDialog(!emailDialog)}
                >
                  <EmailDialog setEmailDialog={setEmailDialog} />
                </Dialog>
                <Dialog
                  open={pwdDialog}
                  onOpenChange={() => setPwdDialog(!pwdDialog)}
                >
                  <PasswordDialog setPwdDialog={setPwdDialog} />
                </Dialog>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full justify-end items-center gap-4">
        <div className="relative flex gap-2 items-center">
          {user && (
            <>
              <Button
                onClick={() =>
                  navigate(isVenueOwner ? "/create-venue" : "/create-event")
                }
                variant="default"
              >
                {isVenueOwner ? "Create Venue" : "Create Event"}
              </Button>
            </>
          )}

          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/friends")}
              >
                <Users className="w-5 h-5" />
                <span className="sr-only">Friends</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chats")}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Chats</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Inbox className="w-5 h-5" />
                    <span className="sr-only">Invitations</span>
                  </Button>
                </DialogTrigger>
                <InvitationsModal />
              </Dialog>
              <span className="text-sm text-muted-foreground font-medium">
                {balance}₴
              </span>
            </>
          )}

          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem asChild>
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => setEmailDialog(true)}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPwdDialog(true)}>
                    Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={emailDialog}
                onOpenChange={() => setEmailDialog(!emailDialog)}
              >
                <EmailDialog setEmailDialog={setEmailDialog} />
              </Dialog>
              <Dialog
                open={pwdDialog}
                onOpenChange={() => setPwdDialog(!pwdDialog)}
              >
                <PasswordDialog setPwdDialog={setPwdDialog} />
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
