import {
  Beer,
  Info,
  Gift,
  Star,
  MapPin,
  HandCoins,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  INFO_PAGE_PATH,
  OFFERS_PAGE_PATH,
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
} from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { Alert } from "../display_utils/alert";

interface ActionButtonsProps {
  scrollToOrderDrinks: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  scrollToOrderDrinks,
}) => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { openAllBundlesModal } = useBottomSheet();

  if (!restaurant) {
    return null;
  }

  return (
    <div className="flex gap-2 sm:gap-3 mt-5 px-2 pb-2 overflow-x-auto no-scrollbar -mx-4 px-4">
      <button
        onClick={scrollToOrderDrinks}
        className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white"
        style={{
          backgroundColor: restaurant.metadata.primaryColor,
        }}
      >
        <Beer
          size={17}
          style={{
            color: "#FFFFFF",
          }}
        />
        {/* <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> */}
        <span className="text-sm sm:text-sm text-white whitespace-nowrap font-semibold">
          View Menu
        </span>
      </button>

      <button
        className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: { tag: LOYALTY_REWARD_TAG },
          })
        }
      >
        <Gift
          size={17}
          style={{
            color: restaurant?.metadata.primaryColor,
          }}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
          Rewards
        </span>
      </button>

      <button
        className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() => openAllBundlesModal()}
      >
        <HandCoins
          size={17}
          style={{
            color: restaurant?.metadata.primaryColor,
          }}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
          Bundles
        </span>
      </button>

      {(restaurant.info?.customLinks || []).map(
        (customLink: any, idx: number) => {
          return (
            <Alert
              key={idx}
              trigger={
                <button className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white">
                  <SquareArrowOutUpRight
                    size={17}
                    style={{
                      color: restaurant?.metadata.primaryColor,
                    }}
                  />
                  <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
                    {customLink.name}
                  </span>
                </button>
              }
              title={`Go to ${restaurant.name} ${customLink.name}?`}
              description={`You are about to leave Tap In.`}
              onConfirm={() => window.open(customLink.url, "_blank")}
              confirmLabel="Go"
              cancelLabel="Cancel"
            />
          );
        }
      )}
      <button
        className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: { tag: NORMAL_DEAL_TAG },
          })
        }
      >
        <Star
          size={17}
          style={{
            color: restaurant?.metadata.primaryColor,
          }}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
          All Deals
        </span>
      </button>
      <button
        className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() => {
          navigate(INFO_PAGE_PATH.replace(":id", restaurant.id));
        }}
      >
        <Info
          size={17}
          style={{
            color: restaurant?.metadata.primaryColor,
          }}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
          More Info
        </span>
      </button>
      {restaurant.info.address && (
        <Alert
          trigger={
            <button className="flex items-center gap-1 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full border border-gray-300 bg-white">
              <MapPin
                size={17}
                style={{
                  color: restaurant?.metadata.primaryColor,
                }}
              />
              <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap font-semibold">
                Directions
              </span>
            </button>
          }
          title={`Go to ${restaurant.name} Directions?`}
          description={`You are about to leave Tap In.`}
          onConfirm={() =>
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.info.address
              )}`
            )
          }
          confirmLabel="Go"
          cancelLabel="Cancel"
        />
      )}
    </div>
  );
};
