import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Policy, Restaurant, User } from "@/types";
import { fetch_policies } from "@/utils/queries/policies";
import { LOYALTY_REWARD_TAG, OFFERS_PAGE_PATH } from "@/constants";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { itemToStringDescription } from "@/utils/parse";
import { adjustColor } from "@/utils/color";

interface RewardsProps {
  userData: User;
  restaurant: Restaurant;
  onIntentionToRedeem: (policy: Policy) => void;
}

const Rewards: React.FC<RewardsProps> = ({
  userData,
  restaurant,
  onIntentionToRedeem,
}) => {
  const userPoints = userData.points[restaurant.id] || 0;
  const [loyaltyPolicies, setLoyaltyPolicies] = useState<Policy[]>([]);
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<number[]>([]);
  const [widthPercentage, setWidthPercentage] = useState<number | null>(null);
  const [pointsToGo, setPointsToGo] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);

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
      const policies = await fetch_policies(restaurant.id);
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
  }, [restaurant]);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Rewards</h1>
        <button
          onClick={() => {
            setIsOpen(!isOpen); // Toggles the arrow direction
          }}
          className="text-sm font-semibold flex items-center gap-1"
          style={{ color: restaurant.metadata.primaryColor }}
        >
          View Rewards
          {isOpen ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>
      </div>

      {userData && (
        <div className="mt-4 text-left">
          <h3
            className="text-5xl font-bold mb-1"
            style={{ color: restaurant.metadata.primaryColor }}
          >
            {userPoints} Points
          </h3>
          {loyaltyPolicies.length === 0 || userPoints === 0 ? (
            <p className="text-sm text-black-600 mb-11">
              Start earning points and claim rewards!
            </p>
          ) : pointsToGo ? (
            <p className="text-sm text-black-600 mb-11">
              {pointsToGo} points until your next reward!
            </p>
          ) : (
            <p className="text-sm text-black-600 mb-11">Claim your reward!</p>
          )}

          {/* Progress Bar */}
          {loyaltyPolicies.length > 0 &&
            widthPercentage !== null &&
            intervals && (
              <>
                <div className="mt-4 h-3 bg-gray-200 rounded-full w-full">
                  <div
                    className="h-full  rounded-full transition-all duration-300"
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
                    <span>{val}</span>
                  ))}
                </div>
              </>
            )}
        </div>
      )}

      {loyaltyPolicies.length > 0 && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-50 rounded-lg p-4 mt-6 mb-6 border-2 border-gray-200">
            <h3 className="text-black text-lg font-semibold mb-4">
              Rewards you can get
            </h3>

            <div className="space-y-4">
              {loyaltyPolicies.map((policy) => (
                <div
                  key={policy.policy_id}
                  className="grid grid-cols-[4rem_6rem_1fr_auto] items-center gap-4"
                >
                  {/* Image - Fixed Width */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src={
                        "https://s-sdistributing.com/wp-content/uploads/Bud-Light-2.png" ||
                        "/placeholder.svg"
                      }
                      alt={policy.header}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Amount - Fixed Width */}
                  <div className="text-xl text-black font-bold font-[Gilroy] text-left">
                    {policy.definition.action.amount}
                  </div>

                  {/* Description - Takes Remaining Space */}
                  <div className="text-gray-700 font-[Gilroy]">
                    {itemToStringDescription(
                      {
                        id: policy.definition.action.items[0],
                        modifiers: [],
                      },
                      restaurant
                    )}
                  </div>

                  {/* Chevron - Auto Width */}
                  {userPoints >= policy.definition.conditions[0].amount && (
                    <div
                      className="text-gray-700 inline-flex items-center rounded-full px-4 py-1 w-fit  text-white"
                      style={{
                        background: restaurant?.metadata.primaryColor
                          ? `linear-gradient(90deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)},
        ${adjustColor(restaurant.metadata.primaryColor as string, -30)}
      )`
                          : undefined,
                      }}
                      onClick={() => onIntentionToRedeem(policy)}
                    >
                      <span className="text-[10px]">Redeem</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Rewards Button */}
      <button
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: { tag: LOYALTY_REWARD_TAG },
          })
        }
        className="mt-4 rounded-lg flex items-center justify-left gap-2 text-white w-fit max-w-sm px-5 py-2.5 text-sm"
        style={{
          background: restaurant?.metadata.primaryColor
            ? `linear-gradient(45deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
      )`
            : undefined,
        }}
      >
        Redeem Rewards
      </button>
    </>
  );
};

export default Rewards;
