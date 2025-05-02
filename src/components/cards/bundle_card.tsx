import { Bundle, BundleItem, Policy, Restaurant } from "@/types";

import { project_url } from "@/utils/supabase_client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon } from "lucide-react";
import { adjustColor } from "@/utils/color";
import {
  BUNDLE_IMAGE_BUCKET,
  MY_SPOT_PATH,
  RESTAURANT_IMAGE_BUCKET,
} from "@/constants";
import { convertUtcToLocal } from "@/utils/parse";
import { ItemUtils } from "@/utils/item_utils";
import { useRestaurant } from "@/context/restaurant_context";
import { BundleUtils } from "@/utils/bundle_utils";
const BundleCard = ({
  restaurant,
  bundleId,
  isOwned,
  onCardClick,
}: {
  restaurant: Restaurant;
  bundleId: string;
  isOwned: boolean;
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
  const baseUrl = `${project_url}/storage/v1/object/public`;

  return (
    <div className="mt-3">
      <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-[380px] rounded-[24px] overflow-hidden bg-white shadow-md border border-gray-400 ">
          <div className="p-4 pb-0">
            <div className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-gray-400">
              <img
                src={`${baseUrl}/${BUNDLE_IMAGE_BUCKET}/${bundle.bundle_id}.jpeg`}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/${RESTAURANT_IMAGE_BUCKET}/${restaurant.id}_profile.png`;
                  setIsFallback(true);
                }}
                alt="Bundle"
                className={`w-full h-[180px] ${
                  isFallback
                    ? "object-contain bg-gray-100 py-2"
                    : "object-cover"
                }`}
                style={{
                  backgroundColor: isFallback ? "#f3f4f6" : undefined, // Tailwind gray-100
                }}
              />

              <div className="absolute bottom-3 left-3 bg-black/80 border border-[#d4af37] rounded-[20px] p-[6px_12px] flex items-center gap-[6px]">
                <img
                  src="/tapin_icon_white.png"
                  alt="Tap In Icon"
                  className="w-4 h-4"
                />
                <span className="text-white text-sm font-medium">
                  Tap In Exclusive
                </span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold m-0 text-gray-800">
                  {bundle.name}
                </h2>
                <p className="text-md text-green-500 mt-1">
                  Save around ${Math.round(savedBundleValue)} with this Bundle
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-semibold text-gray-800">
                  ${bundle.price}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ${Math.round(savedBundleValue + bundle.price) - 0.01}
                </span>
              </div>
            </div>

            <div className="mb-5 min-h-[140px]">
              <p className="text-base font-semibold mb-2 text-gray-700">
                Includes:
              </p>
              <ul className="list-disc pl-5 m-0">
                <li className="text-[15px] h-[30px] text-gray-700">
                  ${bundle.fixed_credit} Credit
                </li>
                <li className="text-[15px] h-[30px] text-gray-700">
                  {bundle.point_multiplier}x Point Multiplier
                </li>
                {childPolicies.length > 0 && (
                  <h2 className="text-base font-semibold mb-2 text-gray-700">
                    Exclusive Access To
                  </h2>
                )}
                {childPolicies.map((policy, index) => (
                  <li
                    key={policy.policy_id}
                    className="text-[15px] text-gray-700"
                    style={{
                      height: childPolicies.length <= 3 ? "30px" : "auto",
                      marginBottom: childPolicies.length > 3 ? "8px" : "0",
                    }}
                  >
                    {policy.name}
                  </li>
                ))}
                {childPolicies.length <= 2 && (
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
                )}
              </ul>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4 text-left">
                Lasts {bundle.duration} {bundle.duration > 1 ? "Days" : "Day"} •
                One-Time Purchase
              </p>
              <button
                className="w-full bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-white border-none rounded-full py-[14px] text-base font-medium enhance-contrast"
                style={{
                  background: restaurant?.metadata.primaryColor,
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
                  "View this Bundle"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;
