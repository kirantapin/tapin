import { ChevronLeft, Gift, PartyPopper, Star } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
  RESTAURANT_PATH,
} from "@/constants";
import { Policy, Restaurant } from "@/types";

import Rewards from "@/components/rewards.tsx";
import { setThemeColor } from "@/utils/color";
import { OffersSkeleton } from "@/components/skeletons/offers_skeleton";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import React from "react";
import { PolicyCard } from "@/components/cards/policy_card";
import GoToCartButton from "@/components/buttons/go_to_cart_button";
import SpendGoalCard from "@/components/cards/spend_goal_card";
import { PolicyUtils } from "@/utils/policy_utils";

export default function PoliciesPage() {
  setThemeColor();
  const location = useLocation();
  const [activeTag, setActiveTag] = useState(
    location.state?.tag || NORMAL_DEAL_TAG
  );
  const { restaurant, policyManager } = useRestaurant();
  const policies = React.useMemo(
    () =>
      restaurant && policyManager
        ? policyManager?.getAllPolicies(restaurant)
        : [],
    [restaurant, policyManager]
  );
  const [activePolicies, setActivePolicies] = useState<Policy[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useBottomSheet();
  const [isLoading, setIsLoading] = useState(false);

  const tagMap: Record<
    string,
    { label: string; icon: any; filter: (policy: Policy) => boolean }
  > = {
    [NORMAL_DEAL_TAG]: {
      label: "Deals",
      icon: Star,
      filter: (policy: Policy) =>
        policy.definition.tag === NORMAL_DEAL_TAG && !policy.locked,
    },
    exclusive: {
      label: "Exclusive",
      icon: PartyPopper,
      filter: (policy: Policy) =>
        policy.definition.tag === NORMAL_DEAL_TAG && policy.locked,
    },
    [LOYALTY_REWARD_TAG]: {
      label: "Rewards",
      icon: Gift,
      filter: (policy: Policy) => policy.definition.tag === LOYALTY_REWARD_TAG,
    },
  };

  useEffect(() => {
    if (policies) {
      setIsLoading(true);
      const filtered = policies.filter(tagMap[activeTag].filter);
      setActivePolicies(filtered);
      setIsLoading(false);
    }
  }, [activeTag, policies]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!restaurant) {
    return <OffersSkeleton />;
  }
  return (
    <div className=" mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-white shadow-sm border-b relative z-10 w-full">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 absolute left-4"
          onClick={() => {
            if (
              document.referrer &&
              document.referrer.includes(window.location.origin)
            ) {
              navigate(-1);
            } else {
              navigate(RESTAURANT_PATH.replace(":id", id || ""));
            }
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold w-full text-center">
          Exclusive Offers
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-4 mt-6 mb-8">
        {Object.keys(tagMap).map((tagKey) => (
          <button
            key={tagKey}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap border transition-colors duration-300 font-semibold ${
              activeTag === tagKey ? "text-sm" : "text-sm text-gray-500"
            }`}
            style={
              activeTag === tagKey
                ? {
                    color: restaurant?.metadata.primaryColor,
                    borderColor: restaurant?.metadata.primaryColor,
                  }
                : {
                    backgroundColor: "#f6f8fa",
                    borderColor: "#e5e7eb", // neutral border for inactive
                  }
            }
            onClick={() => {
              setActiveTag(tagKey);
            }}
          >
            {React.createElement(tagMap[tagKey].icon, {
              className: "w-4 h-4 inline-block mr-1.5",
            })}
            {tagMap[tagKey].label}
          </button>
        ))}
      </div>

      {/* Deals */}

      {(activeTag === NORMAL_DEAL_TAG || activeTag === "exclusive") &&
        !isLoading && (
          <div className="px-5 space-y-6 flex flex-col items-center w-full mb-24">
            <SpendGoalCard
              onClick={() => {
                setActiveTag(LOYALTY_REWARD_TAG);
              }}
              progressThreshold={0}
            />
            {activePolicies.length > 0 ? (
              activePolicies.map((policy) => (
                <PolicyCard
                  key={policy.policy_id}
                  cart={state.cart}
                  policy={policy}
                  restaurant={restaurant as Restaurant}
                  dealEffect={state.dealEffect}
                  extraTags={[
                    ...(PolicyUtils.isPolicyUsable(policy, restaurant)
                      ? []
                      : ["Not Currently Active"]),
                  ]}
                />
              ))
            ) : (
              <p className="text-2xl text-black text-center font-bold flex justify-center items-center min-h-[200px]">
                No Active Deals.
              </p>
            )}
          </div>
        )}

      {activeTag === LOYALTY_REWARD_TAG && restaurant && !isLoading && (
        <div className="px-4">
          <Rewards viewAll={true} />
        </div>
      )}

      <GoToCartButton
        restaurant={restaurant}
        cartCount={
          state.cart.reduce((total, item) => total + item.quantity, 0) || 0
        }
      />
    </div>
  );
}
