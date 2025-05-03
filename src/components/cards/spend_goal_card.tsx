import { FC, useEffect, useState } from "react";
import { Restaurant } from "@/types";
import {
  LOYALTY_REWARD_TAG,
  OFFERS_PAGE_PATH,
  POINTS_PER_DOLLAR,
} from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useAuth } from "@/context/auth_context";
import { useNavigate } from "react-router-dom";
import { Policy } from "@/types";
import { adjustColor } from "@/utils/color";

const SpendGoalCard: FC = () => {
  const { restaurant, policyManager } = useRestaurant();
  const { state } = useBottomSheet();

  const { cartResults } = state;
  const { userData } = useAuth();
  const userPoints =
    (userData?.points[restaurant?.id as string] || 0) +
    (cartResults?.totalPoints || 0) -
    (cartResults?.totalPointCost || 0);
  const navigate = useNavigate();
  const [nextReward, setNextReward] = useState<Policy | null>(null);

  const computeRange = (policies: Policy[]) => {
    if (policies.length === 0) return;
    const nextLargest = policies.find(
      (policy) => policy.definition.conditions[0].amount > userPoints
    );
    setNextReward(nextLargest || null);
  };

  useEffect(() => {
    //fetch policies by restaurant ID
    if (!policyManager || !restaurant) return;
    const policies = policyManager.getAllPolicies(restaurant);
    const filteredPolicies = policies.filter(
      (policy) => policy.definition.tag === LOYALTY_REWARD_TAG
    );
    const sortedByValueAsc = [...filteredPolicies].sort(
      (a, b) =>
        a.definition.conditions[0].amount - b.definition.conditions[0].amount
    );
    computeRange(sortedByValueAsc);
  }, [restaurant, policyManager, userData]);

  if (
    !restaurant ||
    !restaurant?.metadata?.enableLoyaltyProgram ||
    !policyManager ||
    !nextReward ||
    !nextReward.definition.conditions[0].amount
  ) {
    return null;
  }

  const progress =
    (userPoints / nextReward.definition.conditions[0].amount) * 100;
  if (progress < 80) {
    return null;
  }
  return (
    <div
      className="w-full rounded-2xl p-4 py-6 relative overflow-hidden bg-white border border-gray-300 mt-4"
      onClick={() => {
        navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
          state: { tag: LOYALTY_REWARD_TAG },
        });
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">
            <span
              className="font-semibold"
              style={{ color: restaurant.metadata.primaryColor as string }}
            >
              $
              {Math.round(
                nextReward.definition.conditions[0].amount - userPoints
              ) / POINTS_PER_DOLLAR}
            </span>{" "}
            away from next reward
          </span>
        </div>

        <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(45deg, 
              ${adjustColor(restaurant.metadata.primaryColor as string, 40)},
              ${adjustColor(restaurant.metadata.primaryColor as string, -30)}
            )`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpendGoalCard;
