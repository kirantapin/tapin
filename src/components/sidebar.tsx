import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // or use Lucide if preferred
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import { SIGNIN_PATH } from "../constants.ts";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { userSession, logout } = useAuth();
  const [tabs, setTabs] = useState<string[]>(["Sign In"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userSession) {
      setTabs(["Sign Out"]);
    } else {
      setTabs(["Sign In"]);
    }
  }, [userSession]);

  const handleTabClick = (tab: string) => {
    if (tab === "Sign In") {
      navigate(SIGNIN_PATH);
    }
    if (tab === "Sign Out") {
      logout();
    }
    onClose();
  };

  return (
    // <Drawer
    //   anchor="left"
    //   open={isOpen}
    //   onClose={onClose}
    //   PaperProps={{
    //     sx: {
    //       width: 200,
    //       borderTopRightRadius: 16,
    //       borderBottomRightRadius: 16,
    //       overflow: "hidden",
    //       position: "relative",
    //     },
    //   }}
    // >
    //   {/* Close button */}
    //   <IconButton
    //     onClick={onClose}
    //     sx={{ position: "absolute", top: 8, right: 8 }}
    //     aria-label="Close"
    //   >
    //     <CloseIcon />
    //   </IconButton>

    //   {/* Logo */}
    //   <div style={{ padding: "12px", textAlign: "center", paddingTop: "40px" }}>
    //     <img
    //       src="/tapin_logo_black.png"
    //       alt="TapIn Logo"
    //       style={{ width: "120px", marginBottom: "10px" }}
    //     />
    //   </div>

    //   <List>
    //     {tabs.map((tab) => (
    //       <ListItem
    //         component="button"
    //         key={tab}
    //         onClick={() => handleTabClick(tab)}
    //         sx={{ color: "black" }}
    //       >
    //         <ListItemText primary={tab} />
    //       </ListItem>
    //     ))}
    //   </List>
    // </Drawer>
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 200,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          overflow: "hidden",
        },
      }}
    >
      {/* Header with logo + close button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <img src="/tapin_logo_black.png" alt="TapIn Logo" className="w-28" />
        <IconButton onClick={onClose} aria-label="Close" sx={{ padding: 1 }}>
          <CloseIcon />
        </IconButton>
      </div>

      <List>
        {tabs.map((tab) => (
          <ListItem
            component="button"
            key={tab}
            onClick={() => handleTabClick(tab)}
            sx={{ color: "black" }}
          >
            <ListItemText primary={tab} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
