import React, { useEffect, useState } from "react";
import { Restaurant, BundleItem } from "@/types";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import DealCard from "./cards/small_policy";
import { useGlobalCartManager } from "@/hooks/useGlobalCartManager";
import { useAuth } from "@/context/auth_context";
import { CircleX, Wallet } from "lucide-react";
import { BundleUtils } from "@/utils/bundle_utils";
import BundleSlider from "./sliders/bundle_slider";

interface ManageBundlesProps {
  restaurant: Restaurant;
}

const ManageBundles: React.FC<ManageBundlesProps> = () => {
  const { restaurant, userOwnershipMap, policyManager } = useRestaurant();
  const { userSession } = useAuth();
  const [policyStatsMap, setPolicyStatsMap] = useState<
    Record<string, Record<string, string[]>> | undefined
  >(undefined);
  const { state } = useGlobalCartManager(restaurant, userSession);

  useEffect(() => {
    const fetchPolicyStats = async () => {
      const results: Record<string, Record<string, string[]>> = {};

      for (const [bundleId, isOwned] of Object.entries(userOwnershipMap)) {
        if (isOwned) {
          const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
            bundleId,
            restaurant as Restaurant
          ) as BundleItem;
          if (bundleMenuItem && bundleMenuItem.price) {
            const bundle = bundleMenuItem.object;
            const stats = await BundleUtils.getUsersBundleUsageStats(
              userSession.user.phone,
              bundle
            );
            results[bundleId] = stats;
          }
        }
      }
      setPolicyStatsMap(results);
    };

    if (userSession && userOwnershipMap && restaurant) {
      fetchPolicyStats();
    }
  }, [userSession, userOwnershipMap, restaurant]);

  if (!restaurant || policyStatsMap === undefined) {
    return null;
  }

  return (
    <div>
      <div className="space-y-2">
        {Object.entries(userOwnershipMap).map(([bundleId, isOwned]) => {
          if (!isOwned) {
            return null;
          }

          const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
            bundleId,
            restaurant
          );
          if (!bundleMenuItem || !bundleMenuItem.price) {
            return null;
          }

          const bundle = bundleMenuItem.object;
          const childPolicies = restaurant.menu[bundleId].info.bundle_policies;

          return (
            <div key={bundleId}>
              <div className="mb-4 mt-8 px-4">
                <h1 className="text-xl font-bold mb-2">{bundle.name}</h1>
                <div className="flex items-center gap-4 text-black bg-white mt-4">
                  <div className="  text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1 whitespace-nowrap border border-gray-300">
                    <CircleX className="w-4 h-4" />
                    <h2 className="text-md">
                      {bundle.point_multiplier}x Points
                    </h2>
                  </div>
                  <div className="  text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1 whitespace-nowrap border border-gray-300">
                    <Wallet className="w-4 h-4" />
                    <h2 className="text-md">
                      ${bundle.fixed_credit.toFixed(2)} Credit Added
                    </h2>
                  </div>
                </div>
              </div>
              <div className=" mt-6">
                <div className="px-4">
                  <h2 className="text-lg font-bold mb-2">
                    Unredeemed Benefits
                  </h2>
                </div>
                <div className="flex gap-10 pb-4 overflow-x-auto no-scrollbar -mx-3 px-3">
                  {childPolicies.map((policyId: string, index: number) => {
                    const policy = policyManager?.getPolicyFromId(policyId);
                    if (!policy) return null;
                    const numUsages =
                      policyStatsMap?.[bundleId]?.[policyId]?.length || 0;
                    const lastUsed =
                      policyStatsMap?.[bundleId]?.[policyId]?.[0] || null;
                    const daysSinceLastUsed = lastUsed
                      ? Math.floor(
                          (Date.now() - new Date(lastUsed).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;
                    return (
                      <div key={index} className="flex-none w-[280px] px-2">
                        <DealCard
                          policy={policy}
                          restaurant={restaurant}
                          dealEffect={state.dealEffect}
                          cart={state.cart}
                        />
                        <div className="flex gap-2 border p-2 rounded-full mt-2 border-black">
                          {policy.total_usages && (
                            <p>{policy.total_usages - numUsages} Uses Left</p>
                          )}
                          {policy.days_since_last_use && (
                            <p>
                              {daysSinceLastUsed === null
                                ? "Ready to use"
                                : daysSinceLastUsed >=
                                  policy.days_since_last_use
                                ? "Ready to use"
                                : `${
                                    policy.days_since_last_use -
                                    daysSinceLastUsed
                                  } ${
                                    policy.days_since_last_use -
                                      daysSinceLastUsed ===
                                    1
                                      ? "day"
                                      : "days"
                                  } until next use`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <BundleSlider onCardClick={() => {}} />
      </div>
    </div>
  );
};

export default ManageBundles;
