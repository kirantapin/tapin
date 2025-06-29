import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ImageUtils } from "@/utils/image_utils";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { ImageShimmer } from "./image_shimmer";

export function Hero({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const { restaurant } = useRestaurant();
  const { openProfileModal, openCheckoutModal } = useBottomSheet();

  const [profileLoaded, setProfileLoaded] = useState(false);

  const backgroundImageUrl = ImageUtils.getHeroImageUrl(restaurant);
  const profileImageUrl = ImageUtils.getProfileImageUrl(restaurant);

  useEffect(() => {
    if (!profileImageUrl) return;
    const img = new Image();
    img.src = profileImageUrl;
    img.onload = () => setProfileLoaded(true);
  }, [profileImageUrl]);

  const buttonBackgroundColor = "white";
  const buttonColor = "black";
  return (
    <div className="relative h-52 rounded-b-2xl overflow-visible">
      {/* Background image layer with ImageShimmer */}
      <div className="absolute inset-0 rounded-b-2xl overflow-hidden">
        <ImageShimmer
          src={backgroundImageUrl || ""}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute w-full top-0 z-10 flex justify-between items-center px-4 py-3">
        <div
          className=" p-2 rounded-full"
          style={{ backgroundColor: buttonColor }}
          onClick={() => {
            setSidebarOpen(true);
          }}
        >
          <Menu className="w-5 h-5" style={{ color: buttonBackgroundColor }} />
        </div>

        {/* Shopping Bag & User Icons */}
        <div className="flex items-center gap-5">
          <div
            className=" p-2 rounded-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => {
              openCheckoutModal();
            }}
          >
            <ShoppingBag
              className="w-5 h-5"
              style={{ color: buttonBackgroundColor }}
            />
          </div>
          <div
            className=" p-2 rounded-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => {
              openProfileModal();
            }}
          >
            <User
              className="w-5 h-5"
              style={{ color: buttonBackgroundColor }}
            />
          </div>
        </div>
      </div>
      {/* Profile Image */}
      {restaurant && (
        <div className="absolute -bottom-6" style={{ left: "18px" }}>
          <div className="w-24 h-24 rounded-full border-2 border-white overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)]">
            {/* Shimmer placeholder */}
            {!profileLoaded && (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            )}
            <img
              src={profileImageUrl || ""}
              alt="Profile"
              className={`w-full h-full object-cover transition-opacity duration-2000 ${
                profileLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
