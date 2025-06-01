import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { Bundle, BundleItem } from "@/types";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function BundleCTA() {
  const { restaurant, userOwnershipMap } = useRestaurant();
  const { openAllBundlesModal, state } = useBottomSheet();
  const [chosenBundle, setChosenBundle] = useState<Bundle | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (
      !restaurant ||
      !userOwnershipMap ||
      !state.cartResults ||
      state.cartResults.totalPrice <= 0
    ) {
      setChosenBundle(null);
      return;
    }
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
    <div className="mb-0">
      <div className="border-t border-gray-200 -mx-4" />
      <div
        className="py-2 px-4 flex items-center gap-4 cursor-pointer"
        onClick={() => {
          setChecked(true);
          setTimeout(() => {
            openAllBundlesModal();
          }, 300);
          setTimeout(() => {
            setChecked(false);
          }, 2000);
        }}
      >
        <div
          className={`w-6 h-6 border-2 border-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300`}
          style={{
            backgroundColor: checked
              ? (restaurant.metadata.primaryColor as string)
              : "transparent",
          }}
        >
          {checked && <Check strokeWidth={3} className="w-3 h-3 text-white" />}
        </div>
        <span className="text-md">
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
