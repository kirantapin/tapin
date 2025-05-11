import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { Bundle, BundleItem } from "@/types";
import { useEffect, useState } from "react";

export default function BundleCTA() {
  const { restaurant, userOwnershipMap } = useRestaurant();
  const { openBundleModal, state } = useBottomSheet();
  const [chosenBundle, setChosenBundle] = useState<Bundle | null>(null);

  useEffect(() => {
    if (
      !restaurant ||
      !userOwnershipMap ||
      !state.cartResults ||
      state.cartResults.totalPrice <= 0
    )
      return;
    for (const bundleId of Object.keys(userOwnershipMap)) {
      if (!userOwnershipMap[bundleId]) {
        const bundle = ItemUtils.getMenuItemFromItemId(
          bundleId,
          restaurant
        ) as BundleItem;
        if (bundle.object.fixed_credit > 0) {
          setChosenBundle(bundle.object);
        }
      }
    }
  }, [restaurant, userOwnershipMap, state.cartResults]);

  if (!chosenBundle || !restaurant || !state.cartResults) return null;

  return (
    <div className="mt-2 mb-4">
      <div className="border-t border-gray-200 -mx-4" />
      <div
        className="py-2 px-4 flex items-center gap-4 cursor-pointer"
        onClick={() => openBundleModal(chosenBundle)}
      >
        <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />
        <span className="text-sm">
          <span
            className="font-semibold"
            style={{ color: restaurant.metadata.primaryColor as string }}
          >
            Save $
            {Math.min(
              chosenBundle.fixed_credit,
              state.cartResults.totalPrice ?? 0
            ).toFixed(2)}
          </span>{" "}
          on this order and receive other {restaurant.name} perks
        </span>
      </div>
      <div className="border-t border-gray-200 -mx-4" />
    </div>
  );
}
