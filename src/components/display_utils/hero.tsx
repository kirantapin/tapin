import { DRINK_CHECKOUT_PATH, RESTAURANT_IMAGE_BUCKET } from "@/constants";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { project_url } from "@/utils/supabase_client";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Hero({
  restaurant_id,
  setSidebarOpen,
}: {
  restaurant_id: string;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { restaurant } = useRestaurant();
  const { openProfileModal } = useBottomSheet();
  const navigate = useNavigate();

  const [bgLoaded, setBgLoaded] = useState(false);

  const backgroundImageUrl = `${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant_id}_hero.jpeg`;

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImageUrl;
    img.onload = () => setBgLoaded(true);
  }, [backgroundImageUrl]);

  const buttonBackgroundColor = "white";
  const buttonColor = "black";
  return (
    <div className="relative h-52 rounded-b-2xl overflow-visible">
      {/* Shimmer placeholder */}
      {!bgLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Background image layer */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-200 ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backgroundImageUrl})`,
        }}
      />
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
              navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant_id));
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
        <div className="absolute -bottom-5" style={{ left: "18px" }}>
          {/* Moved further down */}
          <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-2xl">
            <img
              src={`${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant_id}_profile.png`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
