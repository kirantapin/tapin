import { useState, useEffect } from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
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
    console.log("userSession", userSession);
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
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <div style={{ padding: "12px", textAlign: "center" }}>
        <img
          src="/tapin_logo_black.png"
          alt="TapIn Logo"
          style={{ width: "120px", marginBottom: "10px" }}
        />
      </div>
      <List sx={{ width: 250 }}>
        {tabs.map((tab) => (
          <ListItem
            component="button"
            key={tab}
            onClick={() => {
              handleTabClick(tab);
              onClose();
            }}
            sx={{ color: "black" }}
          >
            <ListItemText primary={tab} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
