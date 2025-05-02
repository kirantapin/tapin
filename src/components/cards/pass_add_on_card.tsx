import { CartState, PassItem, Policy, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface PassAddOnCardProps {
  addPolicy: (bundle_id: string | null, policy: Policy) => Promise<void>;
  removePolicy: (policy: Policy) => void;
  restaurant: Restaurant;
  policy: Policy;
  state: CartState;
}

export const PassAddOnCard: React.FC<PassAddOnCardProps> = ({
  state,
  addPolicy,
  removePolicy,
  restaurant,
  policy,
}) => {
  const [loading, setLoading] = useState(false);
  if (policy.definition.action.type !== "apply_add_on") {
    return null;
  }
  const passItemId = ItemUtils.policyItemSpecificationsToItemIds(
    policy.definition.action.items,
    restaurant
  )[0];
  if (
    !passItemId ||
    ItemUtils.isItemExpired({ id: passItemId, modifiers: [] }, restaurant)
  ) {
    return null;
  }
  const passItem = ItemUtils.getMenuItemFromItemId(
    passItemId,
    restaurant
  ) as PassItem;
  const name = passItem.name;
  const originalPrice = passItem.price;
  const newPrice = Math.max(0, originalPrice - policy.definition.action.amount);
  const for_date = passItem.for_date;
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
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-300 bg-white relative">
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute top-4 right-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary"></div>
        </div>
      )}

      {/* Checkbox */}
      {policyIds.includes(policy.policy_id) ? (
        <button
          onClick={async () => {
            setLoading(true);
            await removePolicy(policy);
            setLoading(false);
          }}
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center"
          style={{
            backgroundColor: restaurant.metadata.primaryColor as string,
            borderColor: restaurant.metadata.primaryColor as string,
          }}
        >
          <Check className="w-3 h-3 text-white" />
        </button>
      ) : (
        <button
          onClick={async () => {
            setLoading(true);
            await addPolicy(null, policy);
            setLoading(false);
          }}
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors bg-white border-gray-300 "
        />
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Exclusive Badge */}
        <div
          className="inline-block text-white text-xs font-semibold rounded px-2 py-1 mb-1"
          style={{
            backgroundColor: restaurant.metadata.primaryColor as string,
          }}
        >
          EXCLUSIVE (SAVE ${originalPrice - newPrice})
        </div>

        {/* Title / Price */}
        <h3 className="text-lg font-bold text-gray-900">
          Add {name} (+${newPrice.toFixed(2)}){" "}
          {for_date ? (
            <span className="text-sm text-gray-500">({for_date})</span>
          ) : (
            ""
          )}
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
