import { CartState, PassItem, Policy, Restaurant, Item } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface PassAddOnCardProps {
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: Item | null
  ) => Promise<void>;
  removePolicy: (policy_id: string) => void;
  restaurant: Restaurant;
  policy: Policy;
  state: CartState;
  itemId: string;
}

export const PassAddOnCard: React.FC<PassAddOnCardProps> = ({
  state,
  addPolicy,
  removePolicy,
  itemId,
  restaurant,
  policy,
}) => {
  const [loading, setLoading] = useState(false);
  if (policy.definition.action.type !== "add_item") {
    return null;
  }
  if (
    ItemUtils.isItemAvailable(
      { id: itemId, modifiers: [] },
      restaurant,
      state.cart,
      1
    )
  ) {
    return null;
  }
  const passItem = ItemUtils.getMenuItemFromItemId(
    itemId,
    restaurant
  ) as PassItem;
  const name = passItem.name;
  const originalPrice = passItem.price;
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
  const for_date = passItem.for_date;
  // Get policy IDs from all deal effect sources
  const policyAndItemIds: {
    policy_id: string;
    userPreference: Item | null;
  }[] = state.dealEffect.addedItems.map((item) => {
    const cartItem = ItemUtils.getCartItemFromId(item.id, state.cart);
    return {
      policy_id: item.policy_id,
      userPreference: cartItem?.item || null,
    };
  });
  const addOnIsActive = policyAndItemIds.some(
    (item) =>
      item.policy_id === policy.policy_id && item.userPreference?.id === itemId
  );

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border border-gray-300 bg-white relative"
      onClick={async () => {
        setLoading(true);
        if (addOnIsActive) {
          await removePolicy(policy.policy_id);
        } else {
          await addPolicy(null, policy.policy_id, null);
        }
        setLoading(false);
      }}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute top-4 right-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary"></div>
        </div>
      )}

      {/* Checkbox */}
      {addOnIsActive ? (
        <button
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors duration-400"
          style={{
            backgroundColor: restaurant.metadata.primaryColor,
            borderColor: restaurant.metadata.primaryColor,
          }}
        >
          <Check className="w-3 h-3 text-white" />
        </button>
      ) : (
        <button className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors bg-white border-gray-300 " />
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Exclusive Badge */}
        <div
          className="inline-block text-white text-xs font-semibold rounded px-2 py-1 mb-1"
          style={{
            backgroundColor: restaurant.metadata.primaryColor,
          }}
        >
          EXCLUSIVE (SAVE ${(originalPrice - newPrice).toFixed(2)})
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
