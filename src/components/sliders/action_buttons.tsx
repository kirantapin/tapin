import { Beer, Info, Gift, Star, MapPin, HandCoins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GradientIcon } from "@/utils/gradient";
import {
  INFO_PAGE_PATH,
  OFFERS_PAGE_PATH,
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
} from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";

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
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
      >
        <GradientIcon
          icon={Beer}
          primaryColor={restaurant?.metadata.primaryColor as string}
          size={17}
        />
        {/* <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> */}
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
          Order
        </span>
      </button>

      <button
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: { tag: LOYALTY_REWARD_TAG },
          })
        }
      >
        <GradientIcon
          icon={Gift}
          primaryColor={restaurant?.metadata.primaryColor as string}
          size={17}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
          Rewards
        </span>
      </button>

      <button
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() => openAllBundlesModal()}
      >
        <GradientIcon
          icon={HandCoins}
          primaryColor={restaurant?.metadata.primaryColor as string}
          size={17}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
          Bundles
        </span>
      </button>
      <button
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: { tag: NORMAL_DEAL_TAG },
          })
        }
      >
        <GradientIcon
          icon={Star}
          primaryColor={restaurant?.metadata.primaryColor as string}
          size={17}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
          All Deals
        </span>
      </button>
      <button
        className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
        onClick={() => {
          navigate(INFO_PAGE_PATH.replace(":id", restaurant.id));
        }}
      >
        <GradientIcon
          icon={Info}
          primaryColor={restaurant?.metadata.primaryColor as string}
          size={17}
        />
        <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
          More Info
        </span>
      </button>
      {restaurant.info.address && (
        <button
          className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.info.address
              )}`
            )
          }
        >
          <GradientIcon
            icon={MapPin}
            primaryColor={restaurant?.metadata.primaryColor as string}
            size={17}
          />
          <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
            Directions
          </span>
        </button>
      )}
    </div>
  );
};
