import { useRestaurant } from "@/context/restaurant_context";
import { NormalItem, Policy, Restaurant } from "@/types";
import { ImageUtils } from "@/utils/image_utils";
import { ItemUtils } from "@/utils/item_utils";
import { project_url } from "@/utils/supabase_client";
import { Check } from "lucide-react";
import React from "react";
import { titleCase } from "title-case";
import { ImageFallback } from "../display_utils/image_fallback";
interface AddOnCardProps {
  state: any;
  policy: Policy;
  restaurant: Restaurant;
  addPolicy: (policy: Policy) => Promise<void>;
  itemId: string;
}

const AddOnCard: React.FC<AddOnCardProps> = ({
  state,
  policy,
  itemId,
  addPolicy,
  restaurant,
}) => {
  const { policyManager } = useRestaurant();
  if (policy.definition.action.type !== "add_item") {
    return null;
  }
  const menuItem = ItemUtils.getMenuItemFromItemId(
    itemId,
    restaurant
  ) as NormalItem;
  if (!menuItem) {
    return null;
  }
  const name = menuItem.name;
  const originalPrice = menuItem.price;
  const newPrice = (() => {
    const action = policy.definition.action;
    if (action.free) {
      return 0;
    } else if (action.percentDiscount) {
      return parseFloat(
        (originalPrice * (1 - action.percentDiscount)).toFixed(2)
      );
    } else if (action.fixedDiscount) {
      return Math.max(0, originalPrice - action.fixedDiscount);
    }
    return originalPrice;
  })();

  const policies = policyManager
    ? policyManager.getActivePolicies(state.dealEffect)
    : [];
  const active = policies.some((p) => p.policy_id === policy.policy_id);

  return (
    <div className="w-32">
      {/* Image container with 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <ImageFallback
          src={menuItem?.image_url || ""}
          alt={name}
          className="w-full h-full object-cover bg-gray-100"
          restaurant={restaurant}
        />

        {active ? (
          <div className="absolute bottom-2 right-2 flex items-center justify-center bg-white h-7 w-7 rounded-full">
            <Check className="w-4 h-4 text-[#40C4AA]" />
          </div>
        ) : (
          <button
            className="absolute bottom-2 right-2 px-3 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-white"
            style={{ color: "black" }}
            onClick={async () => {
              await addPolicy(policy);
            }}
          >
            Add
          </button>
        )}
      </div>

      {/* Item Details */}
      <div className="mt-2">
        <h3 className="text-md font-semibold text-gray-900">
          {titleCase(name)}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-md font-semibold text-gray-900">
            ${newPrice.toFixed(2)}
          </span>
          <span className="text-md line-through text-gray-500">
            ${originalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddOnCard;
