import React, { useEffect, useState } from "react";
import { Restaurant, BundleItem } from "@/types";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { useAuth } from "@/context/auth_context";
import { CircleX, Wallet } from "lucide-react";
import { BundleUtils } from "@/utils/bundle_utils";
import BundleSlider from "./sliders/bundle_slider";
import { PolicyCard } from "./cards/policy_card";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { GradientIcon } from "@/utils/gradient";
import GoToCartButton from "./go_to_cart_button";
import { PolicyUtils } from "@/utils/policy_utils";
interface ManageBundlesProps {
  restaurant: Restaurant;
}

const ManageBundles: React.FC<ManageBundlesProps> = () => {
  const { restaurant, userOwnershipMap, policyManager } = useRestaurant();
  const { userSession } = useAuth();
  const [policyStatsMap, setPolicyStatsMap] = useState<
    Record<string, Record<string, string[]>> | undefined
  >(undefined);
  const { state, openBundleModal } = useBottomSheet();

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
              userSession.user.id,
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

  const bundlesToDisplay = Object.entries(userOwnershipMap)
    .filter(([bundleId, isOwned]) => {
      if (isOwned) return true;
      const bundle = (restaurant?.menu[bundleId]?.info as BundleItem)?.object;
      return bundle && BundleUtils.isBundlePurchaseable(bundle);
    })
    .map(([bundleId]) => bundleId);

  if (bundlesToDisplay.length === 0) {
    return (
      <div className="mt-8 px-4 flex justify-center">
        <h1 className="text-lg font-semibold">No Available Bundles</h1>
        <GoToCartButton
          restaurant={restaurant}
          cartCount={
            state.cart.reduce((total, item) => total + item.quantity, 0) || 0
          }
        />
      </div>
    );
  }

  return (
    <div>
      {Object.entries(userOwnershipMap).map(([bundleId, isOwned]) => {
        if (!isOwned) {
          return null;
        }

        const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
          bundleId,
          restaurant
        ) as BundleItem;
        if (!bundleMenuItem || !bundleMenuItem.price) {
          return null;
        }

        const bundle = bundleMenuItem.object;
        const childPolicies = bundleMenuItem.bundle_policies;

        return (
          <div key={bundleId}>
            <div className="mb-4 mt-8 px-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-xl font-bold">{bundle.name}</h1>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-md text-gray-500">
                  {(() => {
                    const purchaseDate = new Date(
                      userOwnershipMap[bundleId] as string
                    );
                    const expiryDate = new Date(
                      purchaseDate.getTime() +
                        bundle.duration * 24 * 60 * 60 * 1000
                    );
                    const timeLeft = expiryDate.getTime() - Date.now();
                    const daysLeft = Math.floor(
                      timeLeft / (24 * 60 * 60 * 1000)
                    );
                    const hoursLeft = Math.floor(
                      (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
                    );
                    const minsLeft = Math.floor(
                      (timeLeft % (60 * 60 * 1000)) / (60 * 1000)
                    );

                    if (daysLeft > 0) {
                      return `${daysLeft}d ${hoursLeft}h remaining`;
                    } else {
                      return `${hoursLeft}h ${minsLeft}m remaining`;
                    }
                  })()}
                </div>
                <button
                  className="text-md font-semibold"
                  style={{ color: restaurant?.metadata.primaryColor as string }}
                  onClick={() => {
                    openBundleModal(bundle);
                  }}
                >
                  View Details
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Points Box */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-white h-24 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">
                      Points
                    </span>
                    <GradientIcon
                      icon={CircleX}
                      primaryColor={restaurant?.metadata.primaryColor as string}
                      size={24}
                    />
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {bundle.point_multiplier}x
                  </div>
                </div>

                {/* Credits Box */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-white h-24 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">
                      Credit Earned
                    </span>
                    <GradientIcon
                      icon={Wallet}
                      primaryColor={restaurant?.metadata.primaryColor as string}
                      size={24}
                    />
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    ${bundle.fixed_credit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="px-4">
                <h1 className="text-xl font-bold mb-4">Benefits</h1>
              </div>
              <div className="space-y-8 px-4">
                {childPolicies.map((policyId: string, index: number) => {
                  const policy = policyManager?.getPolicyFromId(policyId);
                  if (!policy) return null;
                  const numUsages =
                    policyStatsMap?.[bundleId]?.[policyId]?.length || 0;
                  const lastUsed =
                    policyStatsMap?.[bundleId]?.[policyId]?.[0] || null;
                  const timeSinceLastUsed = lastUsed
                    ? Math.floor(Date.now() - new Date(lastUsed).getTime())
                    : Infinity;
                  const timeRequired = policy.days_since_last_use
                    ? policy.days_since_last_use * 24 * 60 * 60 * 1000
                    : 0;
                  const diff = timeSinceLastUsed - timeRequired;

                  const tags = [];
                  if (diff < 0) {
                    const absDiff = Math.abs(diff);
                    const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
                    const hours = Math.floor(
                      (absDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
                    );
                    const minutes = Math.floor(
                      (absDiff % (60 * 60 * 1000)) / (60 * 1000)
                    );

                    tags.push(
                      days > 0
                        ? `Ready in ${days}d ${hours}h`
                        : `Ready in ${hours}h ${minutes}m`
                    );
                  }
                  if (policy.total_usages) {
                    tags.push(
                      `${policy.total_usages - numUsages} ${
                        policy.total_usages - numUsages === 1 ? "Use" : "Uses"
                      } Left`
                    );
                  }
                  if (tags.length === 0) {
                    tags.push("Ready to use");
                  }
                  return (
                    <div key={index}>
                      <PolicyCard
                        policy={policy}
                        restaurant={restaurant}
                        dealEffect={state.dealEffect}
                        cart={state.cart}
                        extraTags={[
                          ...tags,
                          ...(PolicyUtils.isPolicyUsable(policy, restaurant)
                            ? []
                            : ["Not Currently Active"]),
                        ]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div className="pb-16">
        {Object.values(userOwnershipMap).some((value) => value === null) && (
          <div className="mt-6 px-1 mb-8">
            <h1 className="text-xl font-bold">Bundles You Might Like</h1>
            <BundleSlider />
          </div>
        )}
      </div>
      <GoToCartButton
        restaurant={restaurant}
        cartCount={
          state.cart.reduce((total, item) => total + item.quantity, 0) || 0
        }
      />
    </div>
  );
};

export default ManageBundles;
