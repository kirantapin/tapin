import { Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // or use Lucide if preferred
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import { BASE_PATH, HISTORY_KEY, RESTAURANT_PATH } from "../constants.ts";
import { ArrowLeft, UserRound } from "lucide-react";
import { Restaurant } from "@/types.ts";
import { SignInButton } from "./signin/signin_button.tsx";
import CustomLogo from "./svg/custom_logo.tsx";
import { ImageUtils } from "@/utils/image_utils.ts";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import { ImageShimmer } from "./display_utils/image_shimmer.tsx";

interface SidebarProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ restaurant, isOpen, onClose }: SidebarProps) => {
  const { userSession, logout } = useAuth();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { triggerToast } = useBottomSheet();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (userSession) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }
  }, [userSession, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  const handleRestaurantClick = (restaurantId: string) => {
    if (restaurantId === restaurant?.id) {
      onClose();
      return;
    }
    onClose();
    navigate(RESTAURANT_PATH.replace(":id", restaurantId));
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
        <CustomLogo
          primaryColor={restaurant?.metadata.primaryColor || "#000000"}
          size={124}
        />
        <IconButton onClick={onClose} aria-label="Close" sx={{ padding: 1 }}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className="px-4 py-2">
        <button
          className="w-full  text-white font-semibold py-3 px-4 rounded-full shadow-md flex items-center justify-center gap-2"
          style={{
            backgroundColor: restaurant?.metadata.primaryColor,
          }}
          onClick={() => {
            //TEMPORARY
            if (process.env.REACT_APP_VERCEL_ENV === "production") {
              triggerToast("Tap In Discovery will be coming soon", "info");
            } else {
              navigate(BASE_PATH);
            }
            onClose();
          }}
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Discover More </span>
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
                  <ImageShimmer
                    src={ImageUtils.getProfileImageUrl(restaurant) || ""}
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
      <div className="px-4 py-2 mt-auto">
        {isSignedIn ? (
          <button
            className="w-full bg-gray-200 text-black font-semibold py-3 px-4 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 mb-4"
            onClick={() => {
              logout();
              triggerToast("Logged out successfully", "info");
              onClose();
            }}
          >
            <UserRound size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        ) : (
          <div className="flex justify-center w-full">
            <SignInButton
              onClose={() => {
                onClose();
              }}
              primaryColor={restaurant?.metadata.primaryColor || "#000000"}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};
