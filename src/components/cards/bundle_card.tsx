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
        console.error(`Policy with id ${id} not found`);
        return null;
      }
      return policy;
    })
    .filter((policy): policy is Policy => policy !== null);

  const { deals, freeItems } =
    BundleUtils.separateBundlePoliciesByType(childPolicies);

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
        <div className="w-full w-[315px] rounded-3xl overflow-hidden bg-white shadow-md border border-gray-400">
          {/* Image is a 2.25:1 aspect ratio width to height */}
          <div className="relative w-full h-[140px]">
            <div
              className={`relative w-full max-w-[350px] aspect-[2.25/1] overflow-hidden ${
                isFallback ? "flex justify-center items-center p-3" : ""
              }`}
            >
              <ImageFallback
                src={ImageUtils.getBundleImageUrl(bundle) || ""}
                restaurant={restaurant}
                postFunction={() => setIsFallback(true)}
                alt="Bundle"
                className={`h-full ${
                  isFallback ? "object-contain" : "w-full object-cover"
                }`}
                style={{
                  ...(isFallback && {
                    padding: 0,
                  }),
                }}
              />
            </div>

            <div className="absolute -bottom-6 right-4 bg-white rounded-full px-5 py-2 shadow-md">
              <span className="text-xl font-semibold text-gray-800">
                ${bundle.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-4 pt-4">
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
                      primaryColor={restaurant?.metadata.primaryColor as string}
                      size={20}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: restaurant?.metadata.primaryColor as string,
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
                      primaryColor={restaurant?.metadata.primaryColor as string}
                      size={20}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: restaurant?.metadata.primaryColor as string,
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
                  .map((policy) => (
                    <div
                      key={policy.policy_id}
                      className="flex items-center gap-2 h-[30px]"
                    >
                      <CheckIcon
                        size={20}
                        strokeWidth={3}
                        color={restaurant?.metadata.primaryColor as string}
                        className="text-gray-700 mb-[6px]"
                      />
                      <p
                        key={policy.policy_id}
                        className="text-[15px] text-gray-700 h-[30px]"
                      >
                        {policy.name}
                      </p>
                    </div>
                  ))}
                <div className="flex items-center gap-2 h-[30px]">
                  <CheckIcon
                    size={20}
                    strokeWidth={3}
                    color={restaurant?.metadata.primaryColor as string}
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
                  background: restaurant?.metadata.primaryColor as string,
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
                  "View Bundle"
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
