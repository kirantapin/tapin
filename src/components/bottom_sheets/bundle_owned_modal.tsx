import React, { useEffect, useState, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { X, Wallet, CircleX, Clock, Sparkles } from "lucide-react";
import { Bundle, Restaurant, Policy, BundleItem } from "@/types";
import { useAuth } from "@/context/auth_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { BundleUtils } from "@/utils/bundle_utils";

import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { titleCase } from "title-case";
import GenericItemIcon from "@/components/display_utils/generic_item_icons";
import { adjustColor } from "@/utils/color";

interface BundleOwnedModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: Bundle;
  restaurant: Restaurant;
  purchasedAt: string;
}

const BundleOwnedModal: React.FC<BundleOwnedModalProps> = ({
  isOpen,
  onClose,
  bundle,
  restaurant,
  purchasedAt,
}) => {
  const { userSession } = useAuth();
  const { policyManager } = useRestaurant();
  const [activeTab, setActiveTab] = useState<"perks" | "benefits">("perks");
  const { triggerToast } = useBottomSheet();
  const [policyStatsMap, setPolicyStatsMap] = useState<
    Record<string, string[]> | undefined
  >(undefined);

  if (!purchasedAt) {
    triggerToast("You do not own this bundle", "error");
    onClose();
  }

  const bundleMenuItem = bundle
    ? (ItemUtils.getMenuItemFromItemId(
        bundle?.bundle_id,
        restaurant
      ) as BundleItem)
    : null;

  const childPolicyIds = bundleMenuItem?.bundle_policies || [];
  const bundlePolicies: Policy[] = childPolicyIds
    .map((id) => {
      const policy = policyManager?.getPolicyFromId(id);
      if (!policy) {
        console.error(`Policy with id ${id} not found`);
        return null;
      }
      return policy;
    })
    .filter((policy): policy is Policy => policy !== null);

  const { deals, freeItems } =
    BundleUtils.separateBundlePoliciesByType(bundlePolicies);

  // Calculate expiration date and days left
  const ownershipInfo = useMemo(() => {
    const purchaseDate = new Date(purchasedAt);
    const expiryDate = new Date(
      purchaseDate.getTime() + bundle.duration * 24 * 60 * 60 * 1000
    );
    const timeLeft = Math.max(0, expiryDate.getTime() - Date.now());
    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor(
      (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    // Format time remaining string
    let timeRemainingString = "";
    if (daysLeft > 0) {
      timeRemainingString = `${daysLeft} ${
        daysLeft === 1 ? "day" : "days"
      } ${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"} left`;
    } else {
      timeRemainingString = `${hoursLeft} ${
        hoursLeft === 1 ? "hour" : "hours"
      } ${minutesLeft} ${minutesLeft === 1 ? "minute" : "minutes"} left`;
    }

    return {
      purchaseDate,
      expiryDate,
      daysLeft,
      hoursLeft,
      minutesLeft,
      timeRemainingString,
      formattedExpiryDate: expiryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }, [purchasedAt, bundle]);

  const primaryColor = restaurant?.metadata.primaryColor || "#8B0000";
  const fromColor = adjustColor(primaryColor, -15);
  const toColor = adjustColor(primaryColor, -45);

  // Fetch policy stats for owned bundles
  useEffect(() => {
    const fetchPolicyStats = async () => {
      if (!userSession || !bundle) return;
      try {
        const stats = await BundleUtils.getUsersBundleUsageStats(
          userSession.user.id,
          bundle
        );
        setPolicyStatsMap(stats);
      } catch (error) {
        console.error("Error fetching policy stats:", error);
        setPolicyStatsMap({});
      }
    };

    if (isOpen) {
      fetchPolicyStats();
    }
  }, [isOpen, userSession, bundle]);

  if (!bundleMenuItem || bundleMenuItem.price == null) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0 overflow-hidden border-t-0 bg-white"
      >
        <div className="flex-1 overflow-y-auto rounded-t-3xl bg-white">
          {/* Membership Card */}
          <div
            className="w-full mt-0 mb-6 rounded-t-3xl p-6 pb-8 relative"
            style={{
              background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
            }}
          >
            {/* Active Membership Badge and Close Button */}
            <div className="absolute top-6 left-6 right-6 flex items-center">
              <div className="flex-1"></div>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/60"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                Active Membership
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none border border-white/60"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Bundle Name */}
            <div className="mb-6 text-center mt-12">
              <div className="text-3xl font-semibold text-white">
                {bundle.name}
              </div>
            </div>

            {/* Credit and Points */}
            {(bundle.fixed_credit > 0 || bundle.point_multiplier > 1) && (
              <div className="flex items-center justify-center mb-4">
                {bundle.fixed_credit > 0 && bundle.point_multiplier > 1 ? (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                    <div className="flex items-center gap-2 justify-end whitespace-nowrap">
                      <Wallet size={20} className="text-white" />
                      <span className="text-white font-medium">
                        ${bundle.fixed_credit.toFixed(2)} Credit
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/30"></div>
                    <div className="flex items-center gap-2 justify-start whitespace-nowrap">
                      <CircleX size={20} className="text-white" />
                      <span className="text-white font-medium">
                        {bundle.point_multiplier}x Points
                      </span>
                    </div>
                  </div>
                ) : bundle.fixed_credit > 0 ? (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Wallet size={20} className="text-white" />
                    <span className="text-white font-medium">
                      ${bundle.fixed_credit.toFixed(2)} Credit
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <CircleX size={20} className="text-white" />
                    <span className="text-white font-medium">
                      {bundle.point_multiplier}x Points
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Days Left */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-white" />
                <span className="text-white font-medium">
                  {ownershipInfo.timeRemainingString}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 mb-6">
            <div className="relative flex w-full bg-gray-100 rounded-full border border-gray-200">
              {/* Animated highlight */}
              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                className="absolute inset-0 rounded-full z-0"
                style={{
                  left: `${activeTab === "perks" ? "0%" : "50%"}`,
                  width: "50%",
                  backgroundColor: primaryColor,
                }}
              />

              <button
                onClick={() => setActiveTab("perks")}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "perks" ? "text-white" : "text-gray-600"
                }`}
              >
                <span className="font-semibold">Perks</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor:
                      activeTab === "perks"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "#9CA3AF",
                    color: "white",
                  }}
                >
                  {freeItems.length}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("benefits")}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "benefits" ? "text-white" : "text-gray-600"
                }`}
              >
                <span className="font-semibold">Benefits</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor:
                      activeTab === "benefits"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "#9CA3AF",
                    color: "white",
                  }}
                >
                  {deals.length}
                </div>
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Perks Tab Content */}
            {activeTab === "perks" && (
              <div className="space-y-4">
                {freeItems.map((policy, index) => {
                  return (
                    <BundlePolicyCard
                      key={index}
                      policy={policy}
                      restaurant={restaurant}
                      policyStats={policyStatsMap?.[policy.policy_id]}
                      primaryColor={primaryColor}
                    />
                  );
                })}
                {freeItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No Perks Available
                  </div>
                )}
              </div>
            )}

            {/* Benefits Tab Content */}
            {activeTab === "benefits" && (
              <div className="space-y-4">
                {deals.map((policy, index) => {
                  if (!policy) return null;
                  return (
                    <BundlePolicyCard
                      key={index}
                      policy={policy}
                      restaurant={restaurant}
                      policyStats={policyStatsMap?.[policy.policy_id]}
                      primaryColor={primaryColor}
                    />
                  );
                })}
                {deals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No Benefits Available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BundleOwnedModal;

// Bundle Policy Card Component
interface BundlePolicyCardProps {
  policy: Policy;
  restaurant: Restaurant;
  policyStats: string[] | undefined;
  primaryColor: string;
}

const BundlePolicyCard: React.FC<BundlePolicyCardProps> = ({
  policy,
  restaurant,
  policyStats,
  primaryColor,
}) => {
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();
  const numUsages = policyStats?.length || 0;
  const lastUsed = policyStats?.[0] || null;
  const timeSinceLastUsed = lastUsed
    ? Math.floor(Date.now() - new Date(lastUsed).getTime())
    : Infinity;
  const timeRequired = policy.days_since_last_use
    ? policy.days_since_last_use * 24 * 60 * 60 * 1000
    : 0;
  const diff = timeSinceLastUsed - timeRequired;

  let isReady = true;
  const tags = [];
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (absDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor((absDiff % (60 * 60 * 1000)) / (60 * 1000));

    tags.push(
      days > 0
        ? `Ready in ${days}d ${hours}h`
        : `Ready in ${hours}h ${minutes}m`
    );
    isReady = false;
  }
  if (policy.total_usages) {
    tags.push(
      `${policy.total_usages - numUsages} ${
        policy.total_usages - numUsages === 1 ? "Use" : "Uses"
      } Left`
    );
    if (policy.total_usages - numUsages <= 0) {
      isReady = false;
    }
  }

  const isUsable = PolicyUtils.isPolicyUsable(policy, restaurant);

  if (!isUsable) {
    tags.push("Not Currently Active");
    isReady = false;
  }

  if (isReady) {
    tags.push("Ready to use");
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-shrink-0">
          {(() => {
            const itemId = PolicyUtils.getPotentialPreferencesForPolicy(
              policy,
              restaurant
            )[0];
            if (itemId) {
              return (
                <GenericItemIcon
                  itemId={itemId}
                  restaurant={restaurant}
                  size={30}
                />
              );
            }
            return <Sparkles size={30} className="text-gray-700" />;
          })()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {titleCase(PolicyUtils.getPolicyName(policy, restaurant))}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {titleCase(
              PolicyUtils.getUsageDescription(policy, restaurant) || ""
            )}
          </p>
          <div className="mt-1">
            <span className="text-xs font-medium text-gray-600">
              {tags.join(" • ")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isReady ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {isReady ? "Ready" : "Not Ready"}
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          handlePolicyClick(policy, userOwnershipMap);
        }}
        className="w-full py-2.5 rounded-full text-white font-semibold"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        Apply
      </button>
    </div>
  );
};
