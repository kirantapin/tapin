import { FC, useEffect, useState } from "react";
import { Restaurant, Policy, PassItem, DealEffectPayload, Item } from "@/types";
import { PassAddOnCard } from "../cards/pass_add_on_card";
import { useRestaurant } from "@/context/restaurant_context";
import AddOnCard from "../cards/add_on_card";
import { ItemUtils } from "@/utils/item_utils";
import { PolicyUtils } from "@/utils/policy_utils";
import { useAuth } from "@/context/auth_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { ADD_ON_TAG } from "@/constants";

interface AddOnManagerProps {
  state: any;
  isPreEntry: boolean;
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: Item | null
  ) => Promise<void>;
  removePolicy: (policy_id: string) => Promise<void>;
  allowPassItems?: boolean;
  allowNormalItems?: boolean;
  allowNoDiscountAddOns?: boolean;
}

const AddOnManager: FC<AddOnManagerProps> = ({
  state,
  isPreEntry,
  addPolicy,
  removePolicy,
  allowPassItems = true,
  allowNormalItems = true,
  allowNoDiscountAddOns = true,
}) => {
  const { restaurant, policyManager } = useRestaurant();
  const { userSession } = useAuth();
  const { openSignInModal, triggerToast, addToCart } = useBottomSheet();
  const [normalItems, setNormalItems] = useState<
    { policy: Policy; itemId: string }[]
  >([]);
  const [passItems, setPassItems] = useState<
    { policy: Policy; itemId: string }[]
  >([]);
  const [noDiscountAddOns, setNoDiscountAddOns] = useState<
    { policy: Policy; itemId: string }[]
  >([]);

  // Implies that `policy` is always an ADD_ON_TAG policy.
  const doesAddOnPolicyHaveDiscount = (
    policy: Policy & {
      definition: {
        tag: typeof ADD_ON_TAG;
        action: { type: "add_item" };
      };
    }
  ) => {
    const { action } = policy.definition;
    if (action.free) return true;
    if (action.percentDiscount && action.percentDiscount > 0) return true;
    if (action.fixedDiscount && action.fixedDiscount > 0) return true;
    return false;
  };

  useEffect(() => {
    if (!restaurant || !policyManager || state.cart.length === 0) {
      return;
    }

    let addOns = policyManager
      .getAddOns(state.cart, state.dealEffect, restaurant)
      .filter((policy) => PolicyUtils.isPolicyUsable(policy, restaurant));

    const addedItems = (
      state.dealEffect as DealEffectPayload
    ).addedItems.filter((item) =>
      addOns.some((policy) => policy.policy_id === item.policy_id)
    );
    const activePolicies = policyManager.getActivePolicies(state.dealEffect);
    addOns = addOns
      .filter((policy) => !activePolicies.includes(policy))
      .sort(
        (a, b) =>
          new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
      );
    const addOnItems: { policy: Policy; itemId: string }[] = [];

    for (const item of addedItems) {
      const policy = policyManager.getPolicyFromId(item.policy_id);
      if (!policy) {
        continue;
      }
      const cartItem = ItemUtils.getCartItemFromId(item.id, state.cart);
      if (!cartItem) {
        continue;
      }
      addOnItems.push({
        policy,
        itemId: cartItem.item.id,
      });
    }
    const seenItemIds = new Set<string>();
    for (const policy of addOns) {
      if (policy.definition.action.type !== "add_item") {
        continue;
      }
      const itemSpecs = policy.definition.action.items || [];
      const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
        itemSpecs,
        restaurant
      );
      for (const itemId of itemIds) {
        if (
          (ItemUtils.priceItem({ id: itemId }, restaurant) || Infinity) <
          (policy.definition.action.priceLimit || Infinity)
        ) {
          if (!seenItemIds.has(itemId)) {
            seenItemIds.add(itemId);
            addOnItems.push({ policy, itemId });
          }
        }
      }
    }
    setNormalItems(
      addOnItems.filter(
        (item) =>
          !ItemUtils.isPassItem(item.itemId, restaurant) &&
          doesAddOnPolicyHaveDiscount(item.policy)
      )
    );
    setNoDiscountAddOns(
      addOnItems.filter((item) => !doesAddOnPolicyHaveDiscount(item.policy))
    );
    setPassItems(
      addOnItems
        .filter(
          (item) =>
            ItemUtils.isPassItem(item.itemId, restaurant) &&
            doesAddOnPolicyHaveDiscount(item.policy)
        )
        .sort((a, b) => {
          const menuItemA = ItemUtils.getMenuItemFromItemId(
            a.itemId,
            restaurant
          ) as PassItem;
          const menuItemB = ItemUtils.getMenuItemFromItemId(
            b.itemId,
            restaurant
          ) as PassItem;
          if (!menuItemA || !menuItemB) {
            return 0;
          }
          return menuItemA.for_date.localeCompare(menuItemB.for_date);
        })
    );
  }, [restaurant, policyManager, state]);
  if (
    !restaurant ||
    !policyManager ||
    state.cart.length === 0 ||
    normalItems.length + passItems.length + noDiscountAddOns.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-4">
      {allowNormalItems && normalItems.length > 0 && (
        <h2 className="text-lg font-bold mb-1">Exclusive Deals</h2>
      )}

      {allowNormalItems && normalItems.length > 0 && (
        <div className="overflow-x-auto pt-2 mb-2 no-scrollbar -mx-4 px-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {normalItems.map(({ policy, itemId }, index) => (
              <AddOnCard
                key={`${policy.policy_id}-${itemId}-${index}`}
                state={state}
                policy={policy}
                itemId={itemId}
                restaurant={restaurant}
                addPolicy={async () => {
                  if (!userSession) {
                    triggerToast("Please sign in to add this item", "info");
                    openSignInModal();
                    return;
                  }
                  await addPolicy(null, policy.policy_id, {
                    id: itemId,
                  });
                }}
                removePolicy={removePolicy}
              />
            ))}
          </div>
        </div>
      )}

      {allowNoDiscountAddOns && noDiscountAddOns.length > 0 && (
        <h2 className="text-lg font-bold mb-1">{restaurant.name} Favorites</h2>
      )}

      {allowNoDiscountAddOns && noDiscountAddOns.length > 0 && (
        <div className="overflow-x-auto pt-2 mb-2 no-scrollbar -mx-4 px-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {noDiscountAddOns.map(({ policy, itemId }, index) => (
              <AddOnCard
                key={`${policy.policy_id}-${itemId}-${index}`}
                state={state}
                policy={policy}
                itemId={itemId}
                restaurant={restaurant}
                addPolicy={async () => {
                  await addToCart(
                    {
                      id: itemId,
                    },
                    true
                  );
                }}
                removePolicy={async (policyId: string) => {}}
              />
            ))}
          </div>
        </div>
      )}

      {allowPassItems && passItems.length > 0 && (
        <div className="mt-2 space-y-4">
          {passItems.slice(0, 2).map(({ policy, itemId }) => (
            <PassAddOnCard
              state={state}
              addPolicy={async () => {
                if (!userSession) {
                  triggerToast("Please sign in to add this item", "info");
                  openSignInModal();
                  return;
                }
                await addPolicy(null, policy.policy_id, {
                  id: itemId,
                });
              }}
              removePolicy={removePolicy}
              restaurant={restaurant as Restaurant}
              policy={policy}
              itemId={itemId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddOnManager;
