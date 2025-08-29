import { useRestaurant } from "@/context/restaurant_context";
import { NormalItem, Policy, Restaurant } from "@/types";
import { ImageUtils } from "@/utils/image_utils";
import { ItemUtils } from "@/utils/item_utils";
import { Check, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { titleCase } from "title-case";
import { ImageFallback } from "../display_utils/image_fallback";
interface AddOnCardProps {
  state: any;
  policy: Policy;
  restaurant: Restaurant;
  addPolicy: (policy: Policy) => Promise<void>;
  itemId: string;
  removePolicy: (policy_id: string) => Promise<void>;
}

const AddOnCard: React.FC<AddOnCardProps> = ({
  state,
  policy,
  itemId,
  addPolicy,
  removePolicy,
  restaurant,
}) => {
  const { policyManager } = useRestaurant();
  const [loading, setLoading] = useState(false);
  if (policy.definition.action.type !== "add_item") {
    return null;
  }
  if (
    ItemUtils.isItemUnavailable(
      { id: itemId },
      restaurant,
      state.cart,
      policy.definition.action.quantity
    )
  ) {
    return null;
  }
  const menuItem = ItemUtils.getMenuItemFromItemId(
    itemId,
    restaurant
  ) as NormalItem;
  if (!menuItem) {
    return null;
  }
  const { quantity, free, percentDiscount, fixedDiscount } =
    policy.definition.action;
  if (quantity === 0) {
    return null;
  }
  const name =
    quantity > 1 ? `${quantity} ${menuItem.name}s` : `${menuItem.name}`;
  const originalPrice = menuItem.price;
  const newPrice = (() => {
    if (free) {
      return 0;
    } else if (percentDiscount) {
      return parseFloat((originalPrice * (1 - percentDiscount)).toFixed(2));
    } else if (fixedDiscount) {
      return Math.max(0, originalPrice - fixedDiscount);
    }
    return originalPrice;
  })();

  const policies = policyManager
    ? policyManager.getActivePolicies(state.dealEffect)
    : [];
  const active = policies.some((p) => p.policy_id === policy.policy_id);

  return (
    <div className="w-28 relative">
      {/* Image container with 1:1 aspect ratio */}
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        <ImageFallback
          src={ImageUtils.getItemImageUrl(itemId, restaurant)}
          alt={name}
          className="w-full h-full object-cover"
          restaurant={restaurant}
        />

        {active ? (
          <div className="absolute bottom-16 right-2 flex items-center justify-center bg-white h-7 w-7 rounded-full border border-gray-200">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            ) : (
              <Check className="w-4 h-4 text-[#40C4AA]" />
            )}
          </div>
        ) : (
          <button
            className="absolute bottom-16 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-md border border-gray-200"
            style={{ color: "black" }}
            onClick={async () => {
              setLoading(true);
              await addPolicy(policy);
              setLoading(false);
            }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* X button positioned relative to outer container */}
      {active && (
        <div
          className="absolute -top-2 -right-2 flex items-center justify-center bg-white h-6 w-6 rounded-full shadow-md border border-gray-200 z-10"
          onClick={async () => {
            setLoading(true);
            await removePolicy(policy.policy_id);
            setLoading(false);
          }}
        >
          <X className="w-3 h-3 text-red-500" />
        </div>
      )}

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
