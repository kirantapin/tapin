import { Policy, Restaurant } from "@/types";
import { itemToStringDescription } from "@/utils/parse";
import { getMenuItemFromPath } from "@/utils/pricer";
import { Check } from "lucide-react";

interface PassAddOnCardProps {
  addPolicy: (policy: Policy) => void;
  restaurant: Restaurant;
  policy: Policy;
  state;
}

export const PassAddOnCard: React.FC<PassAddOnCardProps> = ({
  state,
  addPolicy,
  restaurant,
  policy,
}) => {
  if (policy.definition.action.type !== "apply_add_on") {
    return null;
  }
  const item = {
    path: policy.definition.action.items[0],
    modifiers: [],
  };
  const menuItem = getMenuItemFromPath(item.path, restaurant);
  const name = itemToStringDescription(item);
  const originalPrice = menuItem?.price;
  const newPrice = Math.max(0, originalPrice - policy.definition.action.amount);
  // Get policy IDs from all deal effect sources
  const policyIds = [
    // From modified items
    ...state.dealEffect.modifiedItems.map((item) => item.policy_id),
    // From added items
    ...state.dealEffect.addedItems.map((item) => item.policy_id),
    // From whole cart modifications
    state.dealEffect.wholeCartModification?.policy_id,
  ].filter((id): id is string => id !== undefined);

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-300 bg-white">
      {/* Checkbox */}
      {policyIds.includes(policy.policy_id) ? (
        <div
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center"
          style={{
            backgroundColor: restaurant.metadata.primaryColor,
            borderColor: restaurant.metadata.primaryColor,
          }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      ) : (
        <button
          onClick={() => addPolicy(policy)}
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors bg-white border-gray-300 hover:border-indigo-500"
        />
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Exclusive Badge */}
        <div
          className="inline-block text-white text-xs font-semibold rounded px-2 py-1 mb-1"
          style={{ backgroundColor: restaurant.metadata.primaryColor }}
        >
          EXCLUSIVE (SAVE ${originalPrice - newPrice})
        </div>

        {/* Title / Price */}
        <h3 className="text-lg font-bold text-gray-900">
          Add {name} (+${newPrice.toFixed(2)})
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-1">
          Valued at ${originalPrice.toFixed(2)}. Enjoy this temporary offer
          before it expires! Redeem after purchase.
        </p>
      </div>
    </div>
  );
};
