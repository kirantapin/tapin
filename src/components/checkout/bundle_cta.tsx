import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { Bundle, BundleItem } from "@/types";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { titleCase } from "title-case";
import { BundleUtils } from "@/utils/bundle_utils";
import { formatBundleName } from "@/utils/parse";

export default function BundleCTA() {
  const threshold = 0.4;
  const { restaurant, userOwnershipMap } = useRestaurant();
  const { openAllBundlesModal, state } = useBottomSheet();
  const [chosenBundle, setChosenBundle] = useState<Bundle | null>(null);
  const [checked, setChecked] = useState(false);
  const [alreadyOwnedSavings, setAlreadyOwnedSavings] = useState<number>(0);

  useEffect(() => {
    if (!restaurant || !userOwnershipMap || !state.cartResults) {
      return;
    }
    setChecked(false);
    setAlreadyOwnedSavings(0);
    setChosenBundle(null);
    const creditUsed = state.cartResults.credit.creditUsed;

    if (
      creditUsed / (state.cartResults.subtotal + state.cartResults.discount) >
      threshold
    ) {
      const mostRecentBundleId = Object.entries(userOwnershipMap).reduce<
        null | string
      >((acc, [bundleId, timestamp]) => {
        if (!timestamp) return acc; // skip null timestamps

        if (!acc) return bundleId; // first valid timestamp becomes default

        const currentTimestamp = new Date(timestamp).getTime();
        const accTimestamp = new Date(userOwnershipMap[acc]!).getTime();

        return currentTimestamp > accTimestamp ? bundleId : acc;
      }, null);

      if (mostRecentBundleId) {
        setChosenBundle(
          (
            ItemUtils.getMenuItemFromItemId(
              mostRecentBundleId,
              restaurant
            ) as BundleItem
          ).object
        );
        setAlreadyOwnedSavings(creditUsed);
        setChecked(true);
        return;
      }
    }
    if (state.cartResults.totalPrice > 0) {
      const bestBundle = BundleUtils.suggestBundle(
        restaurant,
        userOwnershipMap,
        state.cartResults
      );

      if (bestBundle) {
        setChosenBundle(bestBundle);
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
          if (alreadyOwnedSavings > 0) {
            return;
          }
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
          className={`w-6 h-6 border-2 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300`}
          style={{
            backgroundColor: checked
              ? (restaurant.metadata.primaryColor as string)
              : "transparent",
            border: checked
              ? `solid ${restaurant.metadata.primaryColor as string}`
              : "solid #9CA3AF",
          }}
        >
          {checked && <Check strokeWidth={3} className="w-3 h-3 text-white" />}
        </div>
        <span className="text-md font-semibold">
          {alreadyOwnedSavings > 0 ? (
            <>
              You're{" "}
              <span
                className="font-semibold"
                style={{ color: restaurant.metadata.primaryColor as string }}
              >
                saving ${alreadyOwnedSavings.toFixed(2)}
              </span>{" "}
              with{" "}
              <strong>{titleCase(formatBundleName(chosenBundle.name))}</strong>
            </>
          ) : (
            <>
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
            </>
          )}
        </span>
      </div>
      <div className="border-t border-gray-200 -mx-4" />
    </div>
  );
}
