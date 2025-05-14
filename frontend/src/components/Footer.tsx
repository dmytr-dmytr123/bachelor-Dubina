import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, CircleUser } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog } from "@/components/ui/dialog";
import useUser from "@/context/User/UserHook";
import EmailDialog from "@/components/Auth/EmailDialog";
import PasswordDialog from "@/components/Auth/PasswordDialog";
import { ModeToggle } from "./mode-toggle";

const Footer = () => {
  const { user, logout } = useUser();
  const [emailDialog, setEmailDialog] = useState(false);
  const [pwdDialog, setPwdDialog] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const isVenueOwner = user?.role === "venue_owner";

  return (
    <footer className=" w-full bg-gray-800 text-white text-center py-2 mt-5">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} SPORTEV. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
