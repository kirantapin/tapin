import { useRestaurant } from "@/context/restaurant_context";
import { Cart, PassItem, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { PassUtils } from "@/utils/pass_utils";
import { useEffect } from "react";

export function useWatcher({
  cart,
  restaurant,
  triggerToast,
  refreshCart,
}: {
  cart: Cart;
  restaurant: Restaurant;
  triggerToast: (message: string, type: "success" | "error" | "info") => void;
  refreshCart: () => Promise<string | null>;
}) {
  const { setRestaurant } = useRestaurant();
  useEffect(() => {
    if (cart.length === 0 || !restaurant) return;

    // Find pass items in cart and count occurrences
    const uniquePassIds = cart
      .filter((cartItem) => {
        const isPass = ItemUtils.isPassItem(cartItem.item.id, restaurant);
        if (!isPass) return false;
        const menuItem = ItemUtils.getMenuItemFromItemId(
          cartItem.item.id,
          restaurant
        ) as PassItem;
        return menuItem?.amount_remaining !== null;
      })
      .reduce((acc: { [key: string]: number }, cartItem) => {
        const passId = cartItem.item.id;
        acc[passId] = (acc[passId] || 0) + cartItem.quantity;
        return acc;
      }, {});

    if (Object.keys(uniquePassIds).length === 0) return;

    const interval = setInterval(async () => {
      console.log("checking");
      const amounts = await Promise.all(
        Object.keys(uniquePassIds).map(async (passId) => {
          const newAmount = await PassUtils.fetchPassAmountRemaining(passId);
          return { passId, newAmount };
        })
      );

      const toasts: { passId: string; amount: number }[] = [];
      const amountUpdates: { passId: string; amount: number }[] = [];
      const passesToRemove: string[] = [];

      amounts.forEach(({ passId, newAmount }) => {
        if (newAmount === null) return;

        const passObject = restaurant.menu[passId].info as PassItem;

        if (
          (passObject.amount_remaining &&
            newAmount < passObject.amount_remaining) ||
          newAmount < uniquePassIds[passId]
        ) {
          amountUpdates.push({ passId, amount: newAmount });
          if (
            newAmount < uniquePassIds[passId] ||
            passObject.end_time < new Date().toISOString()
          ) {
            passesToRemove.push(passId);
          } else if (newAmount <= 5) {
            toasts.push({ passId, amount: newAmount });
          }
        }
      });

      if (passesToRemove.length > 0) {
        // Remove all cart items with matching pass IDs
        const message = await refreshCart();

        if (message) {
          triggerToast(message, "info");
        }
      } else if (toasts.length > 0) {
        const message =
          "Hurry!\n" +
          toasts
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

      if (amountUpdates.length > 0) {
        setRestaurant({
          ...restaurant,
          menu: {
            ...restaurant.menu,
            ...amountUpdates.reduce(
              (acc, { passId, amount }) => ({
                ...acc,
                [passId]: {
                  ...restaurant.menu[passId],
                  info: {
                    ...restaurant.menu[passId].info,
                    amount_remaining: amount,
                  },
                },
              }),
              {}
            ),
          },
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [cart, restaurant]);
}
