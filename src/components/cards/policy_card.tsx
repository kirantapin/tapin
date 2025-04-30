import React from "react";
import { Plus, Tag } from "lucide-react"; // optional: use your own plus icon if needed
import { Cart } from "@/types";
import { Policy } from "@/types";
import { Restaurant } from "@/types";
import { DealEffectPayload } from "@/types";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyManager } from "@/utils/policy_manager";
import { useRestaurant } from "@/context/restaurant_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { GradientIcon } from "@/utils/gradient";
interface PolicyCardProps {
  cart: Cart;
  policy: Policy;
  restaurant: Restaurant;
  dealEffect: DealEffectPayload;
  extraTags?: string[];
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  cart,
  policy,
  restaurant,
  dealEffect,
  extraTags = [],
}) => {
  const primaryColor = restaurant?.metadata.primaryColor as string;
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();
  const policyIsActive = PolicyManager.getActivePolicyIds(dealEffect).has(
    policy.policy_id
  );
  const missingItems = getMissingItemsForPolicy(
    policy,
    cart,
    restaurant,
    dealEffect
  );
  const flair = PolicyUtils.getPolicyFlair(policy);
  const totalMissingQuantity = missingItems.reduce(
    (sum, item) => sum + item.quantityNeeded,
    0
  );
  const missingItemsText =
    totalMissingQuantity > 0
      ? `Add ${totalMissingQuantity} ${
          totalMissingQuantity === 1 ? "item" : "items"
        } to get ${flair}`
      : "";
  return (
    <div
      className="w-full bg-white rounded-3xl p-4  flex relative border border-gray-200 shadow-md"
      onClick={() => {
        handlePolicyClick(policy, userOwnershipMap);
      }}
    >
      <div className="flex flex-col gap-1 flex-grow pr-12">
        {/* Title */}
        <div className="flex items-center gap-2">
          {/* <GradientIcon icon={Tag} primaryColor={primaryColor} size={24} /> */}
          <h2 className="text-xl font-bold text-gray-900 custom-line-clamp-1">
            {titleCase(policy.name)}
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-500 line-clamp-2 whitespace-normal min-h-[3em]">
          {sentenceCase(policy.header)}
        </p>

        <p
          className={`text-sm ${
            !policyIsActive && totalMissingQuantity > 0
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {policyIsActive
            ? `Deal Applied`
            : totalMissingQuantity > 0
            ? missingItemsText
            : `Apply to cart for ${flair}`}
        </p>

        {/* Time and Bundle requirement */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
          {/* Locked? Add requires bundle */}
          {policy.locked && (
            <span className="flex items-center gap-1">
              Requires Bundle
              <img
                src="/tapin_icon_black.png"
                alt="Tap In Icon"
                className="w-4 h-4 ml-1"
              />
            </span>
          )}

          {/* Extra tags */}
          {extraTags.length > 0 && (
            <>
              <span className="text-gray-500">•</span>
              {extraTags.map((tag, index) => (
                <span key={index} className="whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Plus Button */}
      <button
        className="absolute top-4 right-4 text-white rounded-full w-7 h-7 flex items-center justify-center"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
