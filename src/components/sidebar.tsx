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
import { DISCOVER_PATH, HISTORY_KEY, RESTAURANT_PATH } from "../constants.ts";
import { ArrowLeft, UserRound } from "lucide-react";
import { project_url } from "@/utils/supabase_client.ts";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigateToSignIn: () => void;
  setLoading: (loading: boolean) => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  navigateToSignIn,
  setLoading,
}: SidebarProps) => {
  const { userSession, logout } = useAuth();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [tabs, setTabs] = useState<string[]>(["Discover"]);
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (userSession) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }
  }, [userSession]);

  useEffect(() => {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        const recentRestaurants = history.map((item: any) => ({
          name: item.restaurant.name,
          id: item.restaurant.id,
        }));
        setHistory(recentRestaurants);
      } catch (error) {
        console.error("Error parsing restaurant history:", error);
        setHistory([]);
      }
    }
  }, []);

  const handleRestaurantClick = (restaurantId: string) => {
    setLoading(true);
    onClose();
    navigate(RESTAURANT_PATH.replace(":id", restaurantId));
    window.location.reload();
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 200,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 0,
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

      <div className="px-4 py-2">
        <button
          className="w-full bg-[linear-gradient(45deg,#ca8a04,#fde047)] text-white font-semibold py-3 px-4 rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => {
            navigate(DISCOVER_PATH);
            onClose();
          }}
        >
          <ArrowLeft size={20} />
          <span>Discover Bars</span>
        </button>
      </div>

      {history.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold mb-2">Recently Visited</h2>
          <div className="space-y-6">
            {history.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex items-center gap-3 mb-4 cursor-pointer"
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {restaurant.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-4 py-2 mt-auto mb-4">
        <button
          className={`w-full ${
            isSignedIn
              ? "bg-gray-200"
              : "bg-[linear-gradient(45deg,#ca8a04,#fde047)]"
          } text-${
            isSignedIn ? "black" : "white"
          } font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2`}
          onClick={() => {
            if (isSignedIn) {
              logout();
            } else {
              navigateToSignIn();
            }
            onClose();
          }}
        >
          <UserRound size={20} />
          <span>{isSignedIn ? "Logout" : "Sign In"}</span>
        </button>
      </div>
    </Drawer>
  );
};
