import { FC, useEffect, useState } from "react";
import { LOYALTY_REWARD_TAG, POINTS_PER_DOLLAR } from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useAuth } from "@/context/auth_context";
import { useNavigate } from "react-router-dom";
import { Policy } from "@/types";
import { adjustColor } from "@/utils/color";
import { PolicyUtils } from "@/utils/policy_utils";

const SpendGoalCard: FC<{
  onClick: () => void;
  progressThreshold?: number;
}> = ({ onClick, progressThreshold = 80 }) => {
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
  const [nextSmallest, setNextSmallest] = useState<Policy | null>(null);
  const computeRange = (policies: Policy[]) => {
    if (policies.length === 0) return;
    // Find the smallest policy that's still larger than user points
    const nextLargest = policies.reduce((closest, policy) => {
      const points = PolicyUtils.getLoyaltyRewardPoints(policy);
      if (points <= userPoints) return closest;
      if (!closest) return policy;
      return points < PolicyUtils.getLoyaltyRewardPoints(closest)
        ? policy
        : closest;
    }, null as Policy | null);

    // Find the largest policy that's smaller than user points
    const nextSmallest = policies.reduce((closest, policy) => {
      const points = PolicyUtils.getLoyaltyRewardPoints(policy);
      if (points >= userPoints) return closest;
      if (!closest) return policy;
      return points > PolicyUtils.getLoyaltyRewardPoints(closest)
        ? policy
        : closest;
    }, null as Policy | null);
    setNextReward(nextLargest || null);
    setNextSmallest(nextSmallest || null);
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

  const beforePoints = nextSmallest
    ? PolicyUtils.getLoyaltyRewardPoints(nextSmallest)
    : 0;

  const nextPoints = PolicyUtils.getLoyaltyRewardPoints(nextReward);

  const progress = (userProgress / nextPoints) * 100;
  if (progress < progressThreshold) {
    return null;
  }

  const inbetweenProgress =
    ((userProgress - beforePoints) / (nextPoints - beforePoints)) * 100;

  const dollarsAway =
    Math.round(PolicyUtils.getLoyaltyRewardPoints(nextReward) - userProgress) /
    POINTS_PER_DOLLAR;

  return (
    <div
      className="w-full border border-gray-200 rounded-xl p-4 pb-6"
      onClick={onClick}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xl font-semibold">
          {dollarsAway <= 0 ? (
            <>
              Claim Reward after purchase!
              {nextReward && (
                <div className="text-gray-500 text-sm">
                  {PolicyUtils.getPolicyName(nextReward, restaurant)}, applied
                  on next purchase.
                </div>
              )}
            </>
          ) : (
            <>
              <span
                className="font-bold text-2xl"
                style={{ color: restaurant.metadata.primaryColor }}
              >
                ${dollarsAway}
              </span>{" "}
              away from next reward
              {nextReward && (
                <div className="text-gray-500 text-sm">
                  {PolicyUtils.getPolicyName(nextReward, restaurant)}, applied
                  on next purchase.
                </div>
              )}
            </>
          )}
        </span>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className="h-full rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${inbetweenProgress}%`,
              background: `linear-gradient(45deg, 
              ${adjustColor(restaurant.metadata.primaryColor, 30)},
              ${adjustColor(restaurant.metadata.primaryColor, -10)}
            )`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpendGoalCard;
