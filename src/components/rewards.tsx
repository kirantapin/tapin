import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Policy, Restaurant } from "@/types";
import { fetch_policies } from "@/utils/queries/policies";
import {
  PASS_TAG,
  NORMAL_DEAL_TAG,
  LOYALTY_REWARD_TAG,
  RESTAURANT_PATH,
  OFFERS_PAGE_PATH,
  LOYALTY_REWARD_PATH,
} from "@/constants";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { Gift } from "lucide-react";
import { rest } from "lodash";
import { itemToStringDescription } from "@/utils/parse";

interface RewardsProps {
  userData: User;
  restaurant: Restaurant;
}

const Rewards: React.FC<RewardsProps> = ({ userData, restaurant }) => {
  const userPoints = userData.points[restaurant.id];
  const location = useLocation();
  const [loyaltyPolicies, setLoyaltyPolicies] = useState<Policy[]>([]);
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState();
  const [widthPercentage, setWidthPercentage] = useState();
  const [pointsToGo, setPointsToGo] = useState();

  const computeRange = (policies: Policy[]) => {
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
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Rewards</h2>
        <button
          onClick={() => {
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
              state: {
                tag: LOYALTY_REWARD_TAG,
              },
            });
          }}
          className=" text-sm hover:underline font-semibold"
          style={{ color: restaurant.metadata.primaryColor }}
        >
          View Rewards
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
          {pointsToGo ? (
            <p className="text-sm text-black-600 mb-11">
              {pointsToGo} points until your next reward
            </p>
          ) : (
            <p className="text-sm text-black-600 mb-11">Claim your reward!</p>
          )}

          {/* Progress Bar */}
          {widthPercentage && intervals && (
            <>
              <div className="mt-4 h-2 bg-gray-200 rounded-full w-full">
                <div
                  className="h-full  rounded-full transition-all duration-300"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: restaurant.metadata.primaryColor,
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

      <div className="bg-gray-50 rounded-lg p-4 mb-6 mt-4">
        <h3 className="text-gray-800 text-lg font-semibold mb-4">
          Rewards you can get
        </h3>
        <div className="space-y-4">
          {loyaltyPolicies.map((policy) => (
            <div key={policy.policy_id} className="flex items-center">
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
              <div className="ml-2 text-xl text-black font-bold font-[Gilroy]">
                {policy.definition.action.amount}
              </div>
              <div className="ml-10 text-gray-700  font-[Gilroy]">
                {itemToStringDescription({
                  path: policy.definition.action.items[0],
                  modifiers: [],
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Rewards Button */}
      <button
        onClick={() =>
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
            state: {
              tag: LOYALTY_REWARD_TAG,
            },
          })
        }
        className="w-full mt-6 border-2 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
        style={{
          borderColor: restaurant.metadata.primaryColor,
          color: restaurant.metadata.primaryColor,
        }}
      >
        <Gift className="w-5 h-5" />
        Rewards
      </button>
    </>
  );
};

export default Rewards;
