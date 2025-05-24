import { Bundle, BundleItem, Policy, Restaurant } from "@/types";

import { project_url } from "@/utils/supabase_client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, CircleX, Wallet } from "lucide-react";
import {
  BUNDLE_IMAGE_BUCKET,
  MY_SPOT_PATH,
  RESTAURANT_IMAGE_BUCKET,
} from "@/constants";
import { ItemUtils } from "@/utils/item_utils";
import { useRestaurant } from "@/context/restaurant_context";
import { BundleUtils } from "@/utils/bundle_utils";
import CustomIcon from "../svg/custom_icon";
import SmallPolicyCard from "./small_policy_card";
import { GradientIcon } from "@/utils/gradient";
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
  const [isOpen, setIsOpen] = useState(false);
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
  if (bundle.deactivated_at) {
    return null;
  }
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

  const savedBundleValue = BundleUtils.estimateBundleValue(
    bundle,
    restaurant,
    childPolicies
  );
  const isBundleValueGreaterThanPrice = savedBundleValue + 5 > bundle.price;
  const baseUrl = `${project_url}/storage/v1/object/public`;

  return (
    <div className="mt-1">
      <div className="flex items-start p-3">
        <div className="w-full max-w-[340px] rounded-[24px] overflow-hidden bg-white shadow-md border border-gray-400">
          <div className="relative w-full h-[160px]">
            <img
              src={`${baseUrl}/${BUNDLE_IMAGE_BUCKET}/${bundle.bundle_id}.jpeg`}
              onError={(e) => {
                e.currentTarget.src = `${baseUrl}/${RESTAURANT_IMAGE_BUCKET}/${restaurant.id}_profile.png`;
                setIsFallback(true);
              }}
              alt="Bundle"
              className={`w-full h-[160px] ${
                isFallback ? "object-contain bg-gray-100 py-2" : "object-cover"
              }`}
              style={{
                backgroundColor: isFallback ? "#f3f4f6" : undefined,
              }}
            />

            <div className="absolute -bottom-6 right-4 bg-white rounded-full px-5 py-2 shadow-md">
              <span className="text-xl font-semibold text-gray-800">
                ${bundle.price}
              </span>
            </div>
          </div>

          <div className="p-4 pt-4">
            <div className="flex justify-between items-start mb-0">
              <div className="flex-1">
                <h2 className="text-xl font-semibold m-0 text-gray-800">
                  {bundle.name}
                </h2>
              </div>
            </div>

            <div className="mb-5">
              <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                {/* Credits Box */}
                <div className="flex flex-col h-[48px] px-4 rounded-xl bg-white border border-gray-300 shadow-md">
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
                      ${bundle.fixed_credit.toFixed(2)} Credit
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
                {childPolicies.map((policy) => (
                  <div
                    key={policy.policy_id}
                    className="flex items-center gap-2"
                    style={{
                      height: childPolicies.length <= 3 ? "30px" : "auto",
                      marginBottom: childPolicies.length > 3 ? "8px" : "0",
                    }}
                  >
                    <CheckIcon
                      size={20}
                      strokeWidth={3}
                      color={restaurant?.metadata.primaryColor as string}
                      className="text-gray-700 mb-[6px]"
                    />
                    <p
                      key={policy.policy_id}
                      className="text-[15px] text-gray-700"
                      style={{
                        height: childPolicies.length <= 3 ? "30px" : "auto",
                        marginBottom: childPolicies.length > 3 ? "8px" : "0",
                      }}
                    >
                      {policy.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* {childPolicies.length <= 2 && (
                  <>
                    {[...Array(3 - childPolicies.length)].map((_, i) => (
                      <li
                        key={i}
                        className="text-[15px] h-[30px] text-gray-700 invisible"
                      >
                        Spacer
                      </li>
                    ))}
                  </>
                )} */}
            </div>

            <div className="mt-4">
              <button
                className="w-full text-white border-none rounded-full py-[12px] text-base font-semibold enhance-contrast"
                style={{
                  background: restaurant?.metadata.primaryColor as string,
                }}
                onClick={() => {
                  onCardClick(bundle);
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
                    <span>View your Bundle</span>
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
