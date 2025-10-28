import { useRestaurant } from "@/context/restaurant_context";
import React from "react";
import { ImageUtils } from "@/utils/image_utils";
import { useBottomSheet } from "@/context/bottom_sheet_context";

const CookieFooter: React.FC = () => {
  const { restaurant } = useRestaurant();
  const { state } = useBottomSheet();
  const bottomPadding = state.cart.length > 0 ? "pb-28" : "pb-8";
  if (!restaurant) return null;

  const profileImageUrl = ImageUtils.getProfileImageUrl(restaurant);

  return (
    <div className={`w-full bg-white py-8 px-4 ${bottomPadding}`}>
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
            <a
              href="https://go.tapin.app/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              href="https://go.tapin.app/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline cursor-pointer"
            >
              Privacy Policy
            </a>
          </p>
          <p className="text-xs text-gray-500 space-x-2">
            <span className="underline cursor-pointer">
              CA Privacy Statement
            </span>
            <a
              href="https://go.tapin.app/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline cursor-pointer"
            >
              Cookie Preferences
            </a>
          </p>
        </div>

        {/* 7. Divider Line */}
        <div className="border-t border-gray-200 pt-4 pt-6">
          <p className="text-md text-gray-500">
            This site is powered by{" "}
            <a
              href="https://go.tapin.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              style={{ lineHeight: 1 }}
            >
              <img
                src="/tapin_logo_black.png"
                alt="tapin"
                className="inline h-5 align-text-bottom"
                style={{
                  borderBottom:
                    "1px solid #9ca3af" /* thin gray-400 underline */,
                }}
              />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieFooter;
