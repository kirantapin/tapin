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
import { Gift } from "lucide-react";

interface RewardsProps {
  viewAll: boolean;
}

const Rewards: React.FC<RewardsProps> = ({ viewAll }) => {
  const { restaurant, policyManager } = useRestaurant();
  const { openPolicyModal, getActivePolicies } = useBottomSheet();
  const { userData } = useAuth();
  const userPoints = userData?.points[restaurant?.id as string] || 0;
  const [loyaltyPolicies, setLoyaltyPolicies] = useState<Policy[]>([]);
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<number[]>([]);
  const [widthPercentage, setWidthPercentage] = useState<number | null>(null);
  const [pointsToGo, setPointsToGo] = useState<number | null>(null);

  const computeRange = (policies: Policy[]) => {
    if (policies.length === 0) return;
    const maxValue =
      policies[policies.length - 1].definition.conditions[0].amount;
    const fourth = maxValue / 4;
    const intervals = [0, fourth, 2 * fourth, 3 * fourth, 4 * fourth];
    const roundedNumbers = intervals.map((num) => Math.round(num / 100) * 100);
    const progress = Math.round((userPoints / maxValue) * 100);
    const nextLargest = policies.find(
      (policy) => policy.definition.conditions[0].amount > userPoints
    );
    setPointsToGo(nextLargest?.definition.conditions[0].amount - userPoints);
    setIntervals(roundedNumbers);
    setWidthPercentage(progress > 100 ? 100 : progress);
  };

  useEffect(() => {
    //fetch policies by restaurant ID
    const fetchData = async () => {
      if (!policyManager || !restaurant) return;
      const policies = policyManager.getAllPolicies(restaurant);
      const filteredPolicies = policies.filter(
        (policy) => policy.definition.tag === LOYALTY_REWARD_TAG
      );
      const sortedByValueAsc = [...filteredPolicies].sort(
        (a, b) =>
          a.definition.conditions[0].amount - b.definition.conditions[0].amount
      );
      setLoyaltyPolicies(sortedByValueAsc);
      computeRange(sortedByValueAsc);
    };
    fetchData();
  }, [restaurant, policyManager, userData]);

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
        {!viewAll && (
          <button
            onClick={() =>
              navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
                state: { tag: LOYALTY_REWARD_TAG },
              })
            }
            className="flex items-center justify-left gap-2 text-white w-fit max-w-sm py-2.5 text-sm font-semibold"
            style={{
              color: restaurant?.metadata.primaryColor as string,
            }}
          >
            View Rewards
          </button>
        )}
      </div>

      {
        <div className="mt-4 text-left">
          <h3
            className="text-4xl font-bold mb-1"
            style={{ color: restaurant.metadata.primaryColor as string }}
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
                <div className="relative mt-2 h-3 bg-gray-200 rounded-full w-full">
                  {/* Progress fill */}
                  <div
                    className="h-full rounded-full transition-all duration-300 enhance-contrast"
                    style={{
                      width: `${widthPercentage}%`,
                      backgroundColor: restaurant.metadata
                        .primaryColor as string,
                    }}
                  ></div>

                  {/* Dots */}
                  {intervals.map((interval, idx) => {
                    const total = intervals.length - 1;
                    let offset = (idx / total) * 100;
                    if (idx === 0) offset += 1.5;
                    else if (idx === total) offset -= 1.5;

                    return (
                      <div
                        key={idx}
                        className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full z-10 ${
                          userPoints > interval ? "bg-white" : "bg-gray-400"
                        }`}
                        style={{
                          left: `${offset}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      ></div>
                    );
                  })}

                  {/* 🎁 Gift Icon for next reward */}
                  {(() => {
                    const total = intervals[intervals.length - 1];
                    let nextReward = null;
                    if (!pointsToGo) {
                      nextReward = total;
                    } else {
                      nextReward = userPoints + pointsToGo;
                    }

                    let offset = (nextReward / total) * 100;
                    if (nextReward === total) {
                      offset -= 1.5;
                    }
                    return (
                      <Gift
                        className="absolute top-1/2 w-8 h-8 z-20 bg-white shadow-[-4px_0px_6px_rgba(0,0,0,0.1)] rounded-full p-1.5 -translate-y-1/2"
                        style={{
                          left: `${offset}%`,
                          transform: "translate(-50%, -50%)",
                          color: restaurant.metadata.primaryColor as string,
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Number indicators */}
                <div className="flex justify-between text-sm text-gray-500 mt-3">
                  {intervals.map((val, idx) => (
                    <span key={idx}>{formatPoints(val)}</span>
                  ))}
                </div>
              </>
            )}
        </div>
      }

      {loyaltyPolicies.length > 0 && viewAll && (
        <div className="space-y-4 mt-8">
          {loyaltyPolicies.map((policy) => {
            if (
              policy.definition.action.type === "apply_loyalty_reward" ||
              policy.definition.action.type === "add_to_user_credit"
            ) {
              return (
                <LoyaltyRewardItem
                  restaurant={restaurant}
                  policy={policy}
                  numPoints={policy.definition.conditions[0].amount}
                  onRedeem={() => openPolicyModal(policy, null)}
                  isActive={getActivePolicies().includes(policy.policy_id)}
                />
              );
            }
          })}
        </div>
      )}
    </>
  );
};

export default Rewards;
