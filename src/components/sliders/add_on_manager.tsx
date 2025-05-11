import { FC, useEffect, useState } from "react";
import { Restaurant, Policy, PassItem, DealEffectPayload } from "@/types";
import { PassAddOnCard } from "../cards/pass_add_on_card";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useTimer } from "@/hooks/useTimer";
import AddOnCard from "../cards/add_on_card";
import { ItemUtils } from "@/utils/item_utils";

interface AddOnManagerProps {
  state: any;
  isPreEntry: boolean;
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: string | null
  ) => Promise<void>;
  removePolicy: (policy_id: string) => Promise<void>;
  allowTimer?: boolean;
  allowPassItems?: boolean;
  allowNormalItems?: boolean;
}

const AddOnManager: FC<AddOnManagerProps> = ({
  state,
  isPreEntry,
  addPolicy,
  removePolicy,
  allowTimer = true,
  allowPassItems = true,
  allowNormalItems = true,
}) => {
  const {
    timeRemaining: addOnTime,
    isRunning,
    start,
    pause,
    reset,
  } = useTimer(180);
  const { restaurant, policyManager } = useRestaurant();
  const [addOnPolicies, setAddOnPolicies] = useState<Policy[]>([]);
  const [normalItems, setNormalItems] = useState<
    { policy: Policy; itemId: string }[]
  >([]);
  const [passItems, setPassItems] = useState<
    { policy: Policy; itemId: string }[]
  >([]);

  useEffect(() => {
    if (!restaurant || !policyManager || state.cart.length === 0) {
      return;
    }

    let addOns = policyManager.getAddOns(
      state.cart,
      state.dealEffect,
      restaurant
    );

    const addedItems = (
      state.dealEffect as DealEffectPayload
    ).addedItems.filter((item) =>
      addOns.some((policy) => policy.policy_id === item.policy_id)
    );
    const activePolicies = policyManager.getActivePolicies(state.dealEffect);
    addOns = addOns.filter((policy) => !activePolicies.includes(policy));
    setAddOnPolicies(addOns);
    const addOnItems: { policy: Policy; itemId: string }[] = [];

    for (const item of addedItems) {
      const policy = policyManager.getPolicyFromId(item.policy_id);
      if (!policy) {
        continue;
      }
      addOnItems.push({
        policy,
        itemId: item.cartItem.item.id,
      });
    }
    for (const policy of addOns) {
      const itemSpecs = policy.definition.action.items;
      const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
        itemSpecs,
        restaurant
      );
      for (const itemId of itemIds) {
        addOnItems.push({ policy, itemId });
      }
    }
    setNormalItems(
      addOnItems.filter(
        (item) => !ItemUtils.isPassItem(item.itemId, restaurant)
      )
    );
    setPassItems(
      addOnItems
        .filter((item) => ItemUtils.isPassItem(item.itemId, restaurant))
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
  if (!restaurant || !policyManager || state.cart.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {addOnPolicies.length > 0 && (
        <div className="flex items-center gap-2">
          {allowNormalItems && (
            <h2 className="text-lg font-bold mb-4">
              {isPreEntry ? "Exclusive Pre-entry Deals" : "Exclusive Deals"}
            </h2>
          )}
          {allowTimer && (
            <div className="text-md text-red-600 mb-4">
              {addOnTime > 0 ? (
                <span>
                  {Math.floor(addOnTime / 60)}:
                  {(addOnTime % 60).toString().padStart(2, "0")} left to claim
                </span>
              ) : (
                <span className="text-red-500">Expired</span>
              )}
            </div>
          )}
        </div>
      )}
      {allowNormalItems && (
        <div className="overflow-x-auto pb-2 mb-2 no-scrollbar -mx-4 px-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {addOnTime > 0 &&
              normalItems.map(({ policy, itemId }) => (
                <AddOnCard
                  key={policy.policy_id}
                  state={state}
                  policy={policy}
                  itemId={itemId}
                  restaurant={restaurant}
                  addPolicy={async () => {
                    await addPolicy(null, policy.policy_id, itemId);
                    pause();
                  }}
                />
              ))}
          </div>
        </div>
      )}
      {allowPassItems && (
        <div className="mt-2 space-y-4">
          {passItems.slice(0, 2).map(({ policy, itemId }) => (
            <PassAddOnCard
              state={state}
              addPolicy={async () => {
                await addPolicy(null, policy.policy_id, itemId);
                pause();
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
