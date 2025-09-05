import React from "react";
import { Plus } from "lucide-react"; // optional: use your own plus icon if needed
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
import CustomIcon from "../svg/custom_icon";
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
  const primaryColor = restaurant?.metadata.primaryColor;
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
      className="w-full bg-white rounded-xl p-4  flex relative border border-gray-200"
      onClick={() => {
        handlePolicyClick(policy, userOwnershipMap);
      }}
    >
      <div className="flex flex-col gap-1 flex-grow pr-12">
        {/* Title */}
        <div className="flex items-center gap-2">
          {policy.name && (
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 leading-tight min-h-[3rem]">
              {titleCase(policy.name)}
            </h2>
          )}
        </div>

        {/* Description */}
        <p className="text-md text-gray-500 custom-line-clamp-1 -mr-10">
          {policy.header && sentenceCase(policy.header)}
        </p>

        <p
          className={`text-md custom-line-clamp-1 -mr-10 ${
            !policyIsActive && totalMissingQuantity > 0
              ? "text-red-500"
              : "text-[#40C4AA]"
          }`}
        >
          {policyIsActive
            ? `Deal Applied`
            : totalMissingQuantity > 0
            ? missingItemsText
            : `Apply to cart for ${flair}`}
        </p>

        {/* Time and Bundle requirement */}
        <div className="flex flex-wrap items-center gap-2 mt-2 -mr-8 text-sm text-gray-500 font-medium">
          {/* Locked? Add requires bundle */}
          {policy.locked && (
            <span className="flex items-center gap-1">
              Requires Bundle
              <CustomIcon circleColor={primaryColor} size={14} />
            </span>
          )}

          {/* Extra tags */}
          {extraTags.length > 0 && (
            <>
              {extraTags.map((tag, index) => (
                <>
                  {(index !== 0 || policy.locked) && (
                    <span className="text-gray-500">•</span>
                  )}
                  <span key={index} className="whitespace-nowrap">
                    {tag}
                  </span>
                </>
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
