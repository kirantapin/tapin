import { FC, useEffect, useState } from "react";
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
import { PolicyUtils } from "@/utils/policy_utils";

const SpendGoalCard: FC = () => {
  const { restaurant, policyManager } = useRestaurant();
  const { state } = useBottomSheet();

  const { cartResults } = state;
  const { userData } = useAuth();
  const userPoints = userData?.points[restaurant?.id as string] || 0;

  const userProgress =
    userPoints +
    (cartResults?.totalPoints || 0) -
    (cartResults?.totalPointCost || 0);
  const navigate = useNavigate();
  const [nextReward, setNextReward] = useState<Policy | null>(null);

  const computeRange = (policies: Policy[]) => {
    if (policies.length === 0) return;
    const nextLargest = policies.find(
      (policy) => PolicyUtils.getLoyaltyRewardPoints(policy) > userPoints
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
        PolicyUtils.getLoyaltyRewardPoints(a) -
        PolicyUtils.getLoyaltyRewardPoints(b)
    );
    computeRange(sortedByValueAsc);
  }, [restaurant, policyManager, userData]);

  if (
    !restaurant ||
    !restaurant?.metadata?.enableLoyaltyProgram ||
    !policyManager ||
    !nextReward ||
    !PolicyUtils.getLoyaltyRewardPoints(nextReward)
  ) {
    return null;
  }

  const progress =
    (userProgress / PolicyUtils.getLoyaltyRewardPoints(nextReward)) * 100;
  console.log(userProgress, PolicyUtils.getLoyaltyRewardPoints(nextReward));
  if (progress < 80) {
    return null;
  }

  const dollarsAway =
    Math.round(PolicyUtils.getLoyaltyRewardPoints(nextReward) - userProgress) /
    POINTS_PER_DOLLAR;

  return (
    <div
      className="w-full mt-4"
      onClick={() => {
        navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
          state: { tag: LOYALTY_REWARD_TAG },
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-lg font-semibold">
          {dollarsAway <= 0 ? (
            "Claim your reward after purchase!"
          ) : (
            <>
              <span
                className="font-semibold"
                style={{ color: restaurant.metadata.primaryColor as string }}
              >
                ${dollarsAway}
              </span>{" "}
              away from next reward
            </>
          )}
        </span>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
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
