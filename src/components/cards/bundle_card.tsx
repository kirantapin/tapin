import { Bundle, BundleItem, Policy, Restaurant } from "@/types";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckIcon, CircleX, Wallet } from "lucide-react";
import { MY_SPOT_PATH } from "@/constants";
import { ItemUtils } from "@/utils/item_utils";
import { useRestaurant } from "@/context/restaurant_context";
import { BundleUtils } from "@/utils/bundle_utils";
import { GradientIcon } from "@/utils/gradient";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "../display_utils/image_fallback";
import { PolicyUtils } from "@/utils/policy_utils";
const NUM_POLICY_TO_SHOW = 3;

const BundleCard = ({
  restaurant,
  bundleId,
  isOwned,
  onCardClick,
}: {
  restaurant: Restaurant;
  bundleId: string;
  isOwned: string | null;
  onCardClick: (bundle: Bundle) => void;
}) => {
  const location = useLocation();
  const { policyManager } = useRestaurant();
  const navigate = useNavigate();
  const [isFallback, setIsFallback] = useState(false);
  const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
    bundleId,
    restaurant
  ) as BundleItem;
  if (!bundleMenuItem || !bundleMenuItem.price) {
    return null;
  }

  const bundle: Bundle = bundleMenuItem.object;

  const childPolicyIds = bundleMenuItem.bundle_policies;
  const childPolicies: Policy[] = childPolicyIds
    .map((id) => {
      const policy = policyManager?.getPolicyFromId(id);
      if (!policy) {
        return null;
      }
      return policy;
    })
    .filter((policy): policy is Policy => policy !== null);

  const { deals, freeItems } =
    BundleUtils.separateBundlePoliciesByType(childPolicies);

  const estimatedBundleValue = BundleUtils.estimateBundleValue(
    bundle,
    restaurant,
    childPolicies
  );

  return (
    <div
      onClick={() => {
        const onMySpot = location.pathname.includes(
          MY_SPOT_PATH.split("/").slice(-1)[0]
        );
        if (isOwned && !onMySpot) {
          navigate(MY_SPOT_PATH.replace(":id", restaurant?.id), {
            state: { type: "My Bundles" },
          });
        } else {
          onCardClick(bundle);
        }
      }}
    >
      <div className="flex items-start p-1">
        <div className=" w-[315px] rounded-3xl overflow-hidden bg-white shadow-md border border-gray-400">
          {/* Image is a 2.25:1 aspect ratio width to height */}
          <div className="relative  h-[140px] bg-gray-100">
            <div
              className={`relative aspect-[2.25/1] overflow-hidden ${
                isFallback ? "flex justify-center items-center" : ""
              }`}
            >
              <ImageFallback
                src={ImageUtils.getBundleImageUrl(bundle) || ""}
                restaurant={restaurant}
                postFunction={() => setIsFallback(true)}
                alt="Bundle"
                className={`h-full ${
                  isFallback ? "p-3 object-contain" : "w-full object-cover"
                }`}
              />
            </div>

            <div className="absolute -bottom-5 right-4 bg-white rounded-full px-5 py-1.5 shadow-md">
              <span className="text-xl font-semibold text-gray-800">
                ${Math.round(estimatedBundleValue)} Value
              </span>
            </div>
          </div>

          <div className="p-4 pt-5">
            <div className="flex justify-between items-start mb-0 mt-2">
              <div className="flex-1">
                <h2 className="text-xl font-bold m-0 text-gray-800">
                  {bundle.name}
                </h2>
              </div>
            </div>

            <div className="mb-5">
              <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                {/* Credits Box */}
                <div className="flex flex-col h-[48px] px-4 pr-2 rounded-xl bg-white border border-gray-300 shadow-md">
                  <div className="flex items-center gap-2 h-full">
                    <GradientIcon
                      icon={Wallet}
                      primaryColor={restaurant?.metadata.primaryColor}
                      size={20}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: restaurant?.metadata.primaryColor,
                      }}
                    >
                      ${bundle.fixed_credit.toFixed(0)} Credit
                    </span>
                  </div>
                </div>

                {/* Points Box */}
                <div className="flex flex-col h-[48px] px-4 rounded-xl bg-white border border-gray-300 shadow-md">
                  <div className="flex items-center gap-2 h-full">
                    <GradientIcon
                      icon={CircleX}
                      primaryColor={restaurant?.metadata.primaryColor}
                      size={20}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: restaurant?.metadata.primaryColor,
                      }}
                    >
                      {bundle.point_multiplier}x Points
                    </span>
                  </div>
                </div>
              </div>
              {childPolicies.length > 0 && (
                <h2 className="text-base font-semibold mb-2 text-gray-700">
                  Access To
                </h2>
              )}
              <div className="flex flex-col gap-0">
                {[...freeItems, ...deals]
                  .slice(0, NUM_POLICY_TO_SHOW)
                  .map((policy) => {
                    const usageDescription = PolicyUtils.getUsageDescription(
                      policy,
                      restaurant,
                      "short"
                    );
                    return (
                      <div
                        key={policy.policy_id}
                        className="flex items-center gap-2 h-[30px]"
                      >
                        <CheckIcon
                          size={20}
                          strokeWidth={3}
                          color={restaurant?.metadata.primaryColor}
                          className="text-gray-700 mb-[6px] flex-shrink-0"
                        />
                        <p
                          key={policy.policy_id}
                          className="text-[15px] text-gray-700 h-[30px] flex items-center min-w-0"
                        >
                          <span className="whitespace-nowrap">
                            {policy.name}
                          </span>
                          {usageDescription && (
                            <span className="text-gray-500 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] inline-block ml-1">
                              ({usageDescription})
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                <div className="flex items-center gap-2 h-[30px]">
                  <CheckIcon
                    size={20}
                    strokeWidth={3}
                    color={restaurant?.metadata.primaryColor}
                    className="text-gray-700 mb-[6px]"
                  />
                  <p className="text-[15px] text-gray-700 h-[30px]">
                    Access to Exclusive Benefits
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="w-full text-white border-none rounded-full py-[12px] text-base font-semibold enhance-contrast"
                style={{
                  background: restaurant?.metadata.primaryColor,
                }}
              >
                {isOwned ? (
                  <div
                    className="flex items-center justify-center"
                    onClick={() => {
                      navigate(MY_SPOT_PATH.replace(":id", restaurant?.id), {
                        state: { type: "My Bundles" },
                      });
                    }}
                  >
                    <CheckIcon size={20} className="mr-2" />
                    <span className="font-semibold">View your Bundle</span>
                  </div>
                ) : (
                  "View Bundle - $" + bundle.price.toFixed(2)
                )}
              </button>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Lasts {bundle.duration} {bundle.duration > 1 ? "Days" : "Day"} •
                One-Time Purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;
