import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Policy, Restaurant, User } from "@/types";
import { LOYALTY_REWARD_TAG, OFFERS_PAGE_PATH } from "@/constants";
import { formatPoints } from "@/utils/parse";
import { adjustColor } from "@/utils/color";
import { useRestaurant } from "@/context/restaurant_context";
import { LoyaltyRewardItem } from "./menu_items";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useAuth } from "@/context/auth_context";

interface RewardsProps {
  viewAll: boolean;
}

const Rewards: React.FC<RewardsProps> = ({ viewAll }) => {
  const { restaurant, policyManager } = useRestaurant();
  const { openPolicyModal, getActivePolicies } = useBottomSheet();
  const { userData } = useAuth();
  const userPoints =
    userData?.points[restaurant?.id as string | undefined] || 0;
  const [loyaltyPolicies, setLoyaltyPolicies] = useState<Policy[]>([]);
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<number[]>([]);
  const [widthPercentage, setWidthPercentage] = useState<number | null>(null);
  const [pointsToGo, setPointsToGo] = useState<number | null>(null);

  const computeRange = (policies: Policy[]) => {
    if (policies.length === 0) return;
    const maxValue = policies[policies.length - 1].definition.action.amount;
    const fourth = maxValue / 4;
    const intervals = [0, fourth, 2 * fourth, 3 * fourth, 4 * fourth];
    const roundedNumbers = intervals.map((num) => Math.round(num / 100) * 100);
    const progress = Math.round((userPoints / maxValue) * 100);
    const nextLargest = policies.find(
      (policy) => policy.definition.action.amount > userPoints
    );
    setPointsToGo(nextLargest?.definition.action.amount - userPoints);
    setIntervals(roundedNumbers);
    setWidthPercentage(progress > 100 ? 100 : progress);
  };

  useEffect(() => {
    //fetch policies by restaurant ID
    const fetchData = async () => {
      if (!policyManager || !restaurant) return;
      const policies = await policyManager.getAllPolicies(restaurant);
      const filteredPolicies = policies.filter(
        (policy) => policy.definition.tag === LOYALTY_REWARD_TAG
      );
      const sortedByValueAsc = [...filteredPolicies].sort(
        (a, b) => a.definition.action.amount - b.definition.action.amount
      );
      setLoyaltyPolicies(sortedByValueAsc);
      computeRange(sortedByValueAsc);
    };
    fetchData();
  }, [restaurant, policyManager]);

  if (
    !restaurant ||
    !restaurant?.metadata?.enableLoyaltyProgram ||
    !policyManager
  ) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Rewards</h1>
      </div>

      {userData && (
        <div className="mt-4 text-left">
          <h3
            className="text-4xl font-bold mb-1"
            style={{ color: restaurant.metadata.primaryColor }}
          >
            {formatPoints(userPoints)} Points
          </h3>
          {loyaltyPolicies.length === 0 || userPoints === 0 ? (
            <p className="text-sm text-black-600 mb-6">
              Start earning points and claim rewards!
            </p>
          ) : pointsToGo ? (
            <p className="text-sm text-black-600 mb-6">
              {formatPoints(pointsToGo)} points until your next reward!
            </p>
          ) : (
            <p className="text-sm text-black-600 mb-6">Claim your reward!</p>
          )}

          {/* Progress Bar */}
          {loyaltyPolicies.length > 0 &&
            widthPercentage !== null &&
            intervals && (
              <>
                <div className="mt-2 h-3 bg-gray-200 rounded-full w-full">
                  <div
                    className="h-full  rounded-full transition-all duration-300 enhance-contrast"
                    style={{
                      width: `${widthPercentage === 0 ? 2 : widthPercentage}%`,
                      background: restaurant?.metadata.primaryColor
                        ? `linear-gradient(90deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)},
        ${adjustColor(restaurant.metadata.primaryColor as string, -30)}
      )`
                        : undefined,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  {intervals.map((val) => (
                    <span>{formatPoints(val)}</span>
                  ))}
                </div>
              </>
            )}
        </div>
      )}

      {loyaltyPolicies.length > 0 && viewAll && (
        <div className="space-y-4 mt-8">
          {loyaltyPolicies.map((policy) => {
            if (policy.definition.action.type === "apply_loyalty_reward") {
              return (
                <LoyaltyRewardItem
                  restaurant={restaurant}
                  itemSpec={policy.definition.action.items[0]}
                  numPoints={policy.definition.action.amount}
                  onRedeem={() => openPolicyModal(policy, null)}
                  isActive={getActivePolicies().includes(policy.policy_id)}
                />
              );
            }
          })}
        </div>
      )}

      {/* Bottom Rewards Button */}
      {!viewAll && restaurant && (
        <button
          onClick={() =>
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
              state: { tag: LOYALTY_REWARD_TAG },
            })
          }
          className="mt-6 rounded-full flex items-center justify-left gap-2 text-white w-fit max-w-sm px-5 py-2.5 text-sm enhance-contrast"
          style={{
            backgroundColor: restaurant?.metadata.primaryColor,
          }}
        >
          View All Rewards
        </button>
      )}
    </>
  );
};

export default Rewards;
