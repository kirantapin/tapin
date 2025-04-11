import { Policy, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { itemToStringDescription } from "@/utils/parse";
import { getMenuItemFromItemId, priceItem } from "@/utils/pricer";
import { project_url } from "@/utils/supabase_client";
import { Check, Plus } from "lucide-react";
import React from "react";
import { titleCase } from "title-case";
interface AddOnCardProps {
  state: any;
  policy: Policy;
  restaurant: Restaurant;
  addPolicy: (policy: Policy) => Promise<void>;
}

const AddOnCard: React.FC<AddOnCardProps> = ({
  state,
  policy,
  restaurant,
  addPolicy,
}) => {
  console.log(policy);
  if (policy.definition.action.type !== "apply_add_on") {
    return null;
  }
  const item = {
    id: policy.definition.action.items[0],
    modifiers: [],
  };
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);
  const name = menuItem?.name;
  const originalPrice = menuItem?.price;
  const newPrice = Math.max(0, originalPrice - policy.definition.action.amount);

  const primaryColor = restaurant.metadata.primaryColor;
  const policyIds = state.dealEffect.modifiedItems
    .map((item) => item.policy_id)
    .concat(state.dealEffect.addedItems.map((item) => item.policy_id));
  if (state.dealEffect.wholeCartModification?.policy_id) {
    policyIds.push(state.dealEffect.wholeCartModification.policy_id);
  }
  const active = policyIds.some((id) => id === policy.policy_id);

  return (
    <div className="w-32">
      {/* Image container with 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <img
          src={
            menuItem?.image_url ||
            `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
          }
          alt={name}
          className="w-full h-full object-cover bg-gray-100"
        />
        {/* <button
          onClick={onAddToCart}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 active:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button> */}
        {active ? (
          <div className="absolute bottom-2 right-2 flex items-center justify-center bg-white h-7 w-7 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <button
            className="absolute bottom-2 right-2 h-7 w-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            onClick={async () => {
              await addPolicy(policy);
            }}
          >
            <Plus className="h-4 w-4 text-white" />
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
