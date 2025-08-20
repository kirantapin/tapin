import { useRestaurant } from "@/context/restaurant_context";
import React from "react";
import { ImageUtils } from "@/utils/image_utils";

const CookieFooter: React.FC = () => {
  const { restaurant } = useRestaurant();
  if (!restaurant) return null;

  const profileImageUrl = ImageUtils.getProfileImageUrl(restaurant);

  return (
    <div className="w-full bg-white py-8 px-4 pb-28">
      <div className="max-w-md mx-auto text-center">
        {/* 1. Profile Picture */}
        {profileImageUrl && (
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={profileImageUrl}
                alt={`${restaurant.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 2. Restaurant Name, Location and Ordering Hours */}
        <p className="text-lg font-semibold text-gray-500 mb-6">
          {restaurant.name}
        </p>

        <div className="space-y-1 mb-6">
          {restaurant.info.contactNumber && (
            <p className="text-md text-gray-500 font-semibold">
              {restaurant.info.contactNumber}
            </p>
          )}

          {/* 4. Address */}
          {restaurant.info.address && (
            <p className="text-md text-gray-500 max-w-xs mx-auto font-semibold">
              {restaurant.info.address}
            </p>
          )}
        </div>

        {/* 5. Terms of Service and Privacy Statement */}
        <div className="space-y-2 mb-10">
          <p className="text-xs text-gray-500 space-x-2">
            <span className="underline cursor-pointer">Terms of Service</span>
            <span className="underline cursor-pointer">Privacy Statement</span>
          </p>
          <p className="text-xs text-gray-500 space-x-2">
            <span className="underline cursor-pointer">
              CA Privacy Statement
            </span>
            <span className="underline cursor-pointer">Cookie Preferences</span>
          </p>
        </div>

        {/* 7. Divider Line */}
        <div className="border-t border-gray-200 pt-4 pt-6">
          <p className="text-md text-gray-500">
            This site is powered by{" "}
            <img
              src="/tapin_logo_black.png"
              alt="tapin"
              className="inline h-5"
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieFooter;
