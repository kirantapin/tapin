import { useNavigate } from "react-router-dom";
import { Ticket, ChevronRight, GlassWater, AlertCircle } from "lucide-react";
import { Transaction, UserSession } from "@/types";
import { GradientIcon } from "@/utils/gradient";
import {
  PASS_MENU_TAG,
  MY_SPOT_PATH,
  BUNDLE_PURCHASED_SIGNAL,
} from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { useAuth } from "@/context/auth_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { TransactionUtils } from "@/utils/transaction_utils";

interface MySpotProps {
  transactions: Transaction[];
  userSession: UserSession | null;
  postPurchaseSignals: string[];
}

export const MySpot: React.FC<MySpotProps> = ({
  userSession,
  transactions,
  postPurchaseSignals,
}) => {
  const { userData } = useAuth();
  const { userOwnershipMap, restaurant } = useRestaurant();
  const { openSignInModal } = useBottomSheet();
  const navigate = useNavigate();

  const activePassesCount = transactions.filter(
    (t) =>
      t.fulfilled_by === null &&
      t.metadata?.path?.includes(PASS_MENU_TAG) &&
      t.restaurant_id === restaurant?.id &&
      TransactionUtils.isTransactionRedeemable(t, restaurant)
  );

  const activeOrdersCount = transactions.filter(
    (t) =>
      t.fulfilled_by === null &&
      !t.metadata?.path?.includes(PASS_MENU_TAG) &&
      t.restaurant_id === restaurant?.id &&
      TransactionUtils.isTransactionRedeemable(t, restaurant)
  );
  const activeBundlesCount = Object.values(userOwnershipMap).filter(
    (value) => value !== null
  ).length;

  if (!restaurant) {
    return null;
  }

  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold flex items-center gap-2">My Spot</h1>

      {/* My Bundles - full width */}
      {postPurchaseSignals.includes(BUNDLE_PURCHASED_SIGNAL) && (
        <div className="bg-green-100 mt-4 mb-1 px-4 py-3 rounded-xl border border-1 border-green-800 animate-bounce-slower">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-green-800 w-5 h-5" />
            <p className="text-green-800 text-md font-medium">
              View your newly purchased bundle
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <div
          className={`relative ${
            (userData?.next_purchase_credit[restaurant?.id] ?? 0) > 0
              ? "w-2/3"
              : "w-full"
          } h-20 bg-gray-50 rounded-xl border p-4 cursor-pointer`}
          onClick={() => {
            if (!userSession) {
              openSignInModal();
              return;
            }
            navigate(MY_SPOT_PATH.replace(":id", restaurant?.id), {
              state: { type: "My Bundles" },
            });
          }}
        >
          {/* Centered Arrow on Right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Text content (vertically centered by default due to h-20 + p-4) */}
          <div className="flex flex-col justify-center h-full">
            <p className="font-14 text-gray-500 font-medium">My Bundles</p>
            <p className="font-16 font-semibold text-gray-900">
              {activeBundlesCount} Active Bundle
              {activeBundlesCount !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Credit Display */}
        {(userData?.next_purchase_credit[restaurant?.id] ?? 0) > 0 && (
          <div className="w-1/3 h-20 bg-gray-50 rounded-xl border p-4">
            <div className="flex flex-col justify-center items-center h-full">
              <p className="font-14 text-gray-500 font-medium">Credit</p>
              <p
                className="font-18 font-semibold text-gray-900"
                style={{
                  color: restaurant?.metadata.primaryColor,
                }}
              >
                ${userData?.next_purchase_credit[restaurant?.id].toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Passes & Orders Row */}
      <div className="flex gap-4 mt-4 w-full">
        {/* My Passes */}
        <div
          className="relative w-1/2 aspect-[8/5] bg-gray-50 rounded-xl border p-4 cursor-pointer"
          onClick={() => {
            if (!userSession) {
              openSignInModal();
              return;
            }
            navigate(MY_SPOT_PATH.replace(":id", restaurant?.id), {
              state: { type: "Passes" },
            });
          }}
        >
          <div className="absolute top-3 left-3">
            <div className="p-1">
              <GradientIcon
                icon={Ticket}
                primaryColor={restaurant?.metadata.primaryColor}
                size={28}
              />
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-gray-200 rounded-full p-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="absolute bottom-3 left-4">
            <p className="font-14 text-gray-500 font-medium">My Passes</p>
            <p className="font-16 font-semibold text-gray-900">
              {activePassesCount.length} Active Pass
              {activePassesCount.length !== 1 && "es"}
            </p>
          </div>
        </div>

        {/* My Orders */}
        <div
          className="relative w-1/2 aspect-[8/5] bg-gray-50 rounded-xl border p-4 cursor-pointer"
          onClick={() => {
            if (!userSession) {
              openSignInModal();
              return;
            }
            navigate(MY_SPOT_PATH.replace(":id", restaurant?.id), {
              state: { type: "Orders" },
            });
          }}
        >
          <div className="absolute top-3 left-3">
            <div className="p-1">
              <GradientIcon
                icon={GlassWater}
                primaryColor={restaurant?.metadata.primaryColor}
                size={28}
              />
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-gray-200 rounded-full p-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="absolute bottom-3 left-4">
            <p className="font-14 text-gray-500 font-medium">My Orders</p>
            <p className="font-16 font-semibold text-gray-900">
              {activeOrdersCount.length} Item
              {activeOrdersCount.length !== 1 && "s"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
