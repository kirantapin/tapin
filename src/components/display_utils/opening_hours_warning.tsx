import { useRestaurant } from "@/context/restaurant_context";
import React from "react";
import { isOpenNow } from "@/utils/time";
import { AlertCircle } from "lucide-react";

interface OpeningHoursWarningProps {
  context: "checkout" | "redemption";
  marginTop?: number | undefined;
}

export const OpeningHoursWarning: React.FC<OpeningHoursWarningProps> = ({
  context,
  marginTop = undefined,
}) => {
  const { restaurant } = useRestaurant();
  if (!restaurant) return null;

  const { openingHours } = restaurant.info;
  const isLocationOpen = isOpenNow(openingHours, restaurant.metadata.timeZone);

  let message: string | null = null;

  if (isLocationOpen) {
    message = null;
  } else {
    if (context === "checkout") {
      message = `${restaurant.name} is currently closed however you can still purchase items to be stored to your account.`;
    } else {
      message = `${restaurant.name} is currently closed. Items cannot be redeemed at this time.`;
    }
  }

  if (!message) return null;

  return (
    <div
      className={`mb-4 px-4 py-2 rounded-xl border border-1`}
      style={{
        backgroundColor: "white",
        borderColor: "#e5e7eb",
        marginTop: marginTop,
      }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle
          className={`w-6 h-6`}
          style={{
            color: "black",
          }}
        />
        <p
          className={`text-xs font-medium`}
          style={{
            color: "black",
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};
