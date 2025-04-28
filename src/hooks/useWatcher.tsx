import { Cart, PassItem, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { PassUtils } from "@/utils/pass_utils";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function useWatcher({
  cart,
  restaurant,
  triggerToast,
}: {
  cart: Cart;
  restaurant: Restaurant;
  triggerToast: (message: string, type: "success" | "error" | "info") => void;
}) {
  useEffect(() => {
    if (cart.length === 0 || !restaurant) return;

    // Find pass items in cart
    const passIds = cart
      .filter((cartItem) => {
        const isPass = ItemUtils.isPassItem(cartItem.item.id, restaurant);
        if (!isPass) return false;
        const menuItem = ItemUtils.getMenuItemFromItemId(
          cartItem.item.id,
          restaurant
        ) as PassItem;
        return menuItem?.amount_remaining !== null;
      })
      .map((cartItem) => cartItem.item.id);

    const uniquePassIds = [...new Set(passIds)];

    if (uniquePassIds.length === 0) return;

    // Store current amounts to compare against
    const currentAmounts: Record<string, number> = {};

    const interval = setInterval(async () => {
      console.log("checking");
      const amounts = await Promise.all(
        uniquePassIds.map((passId) =>
          PassUtils.fetchPassAmountRemaining(passId)
        )
      );

      const updates: { passId: string; amount: number }[] = [];

      amounts.forEach((amount, index) => {
        const passId = uniquePassIds[index];

        if (amount === null) return;

        if (!(passId in currentAmounts)) {
          currentAmounts[passId] = amount;
          return;
        }

        if (amount < currentAmounts[passId] && amount % 5 === 0) {
          updates.push({ passId, amount });
          currentAmounts[passId] = amount;
        }
      });

      if (updates.length > 0) {
        const message =
          "Hurry!\n" +
          updates
            .map(
              ({ passId, amount }) =>
                `Only ${amount} ${ItemUtils.getItemName(
                  { id: passId, modifiers: [] },
                  restaurant
                )} left!`
            )
            .join("\n");

        triggerToast(message, "info");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [cart, restaurant]);
}
