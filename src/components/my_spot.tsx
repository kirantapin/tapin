import { useNavigate } from "react-router-dom";
import { Ticket, ChevronRight, GlassWater } from "lucide-react";
import { Transaction, Restaurant, UserSession } from "@/types";
import { GradientIcon } from "@/utils/gradient";
import { PASS_MENU_TAG, PREVIOUS_TRANSACTIONS_PATH } from "@/constants";

interface MySpotProps {
  restaurant: Restaurant | null;
  transactions: Transaction[];
  userSession: UserSession | null;
}

export const MySpot: React.FC<MySpotProps> = ({
  userSession,
  restaurant,
  transactions,
}) => {
  const navigate = useNavigate();

  const activePassesCount = transactions.filter(
    (t) =>
      t.fulfilled_by === null &&
      t.metadata?.path?.includes(PASS_MENU_TAG) &&
      t.restaurant_id === restaurant?.id
  );

  const activeOrdersCount = transactions.filter(
    (t) =>
      t.fulfilled_by === null &&
      !t.metadata?.path?.includes(PASS_MENU_TAG) &&
      t.restaurant_id === restaurant?.id
  );

  if (!restaurant || !userSession) {
    return null;
  }

  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold flex items-center gap-2">My Spot</h1>

      <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
        {/* Card 1: My Passes */}
        <div
          className="relative flex-shrink-0 w-[145px] h-[115px] bg-gray-50 rounded-xl border p-4 cursor-pointer"
          onClick={() => {
            navigate(
              PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant?.id),
              {
                state: { showPasses: true },
              }
            );
          }}
        >
          {/* Ticket icon in top-left */}
          <div className="absolute top-3 left-3">
            <GradientIcon
              icon={Ticket}
              primaryColor={restaurant?.metadata.primaryColor as string}
            />
          </div>

          {/* Arrow in top-right */}
          <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Text in bottom-left */}
          <div className="absolute bottom-3 left-4">
            <p className="font-14 text-gray-500 font-medium">My Passes</p>
            <p className="font-16 font-semibold text-gray-900">
              {activePassesCount.length} Active Passes
            </p>
          </div>
        </div>

        {/* Card 2: My Orders */}
        <div
          className="relative flex-shrink-0 w-[145px] h-[115px] bg-gray-50 rounded-xl border p-4 cursor-pointer"
          onClick={() => {
            navigate(
              PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant?.id),
              {
                state: { showPasses: false },
              }
            );
          }}
        >
          <div className="absolute top-3 left-3">
            <GradientIcon
              icon={GlassWater}
              primaryColor={restaurant?.metadata.primaryColor as string}
            />
          </div>
          <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="absolute bottom-3 left-4">
            <p className="font-14 text-gray-500 font-medium">My Orders</p>
            <p className="font-16 font-semibold text-gray-900">
              {activeOrdersCount.length} Items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
