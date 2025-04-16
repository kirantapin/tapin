import {
  Cart,
  Policy,
  ItemSpecification,
  Restaurant,
  CartItem,
  DealEffectPayload,
} from "@/types";
import { ItemUtils } from "./item_utils";

function isCartItemAffectedByPolicy(
  cartItem: CartItem,
  dealEffect: DealEffectPayload
) {
  const { id } = cartItem;
  const { addedItems, modifiedItems } = dealEffect;
  if (addedItems.find((item) => item.cartItem.id === id)) {
    return true;
  }
  if (modifiedItems.find((item) => item.id === id)) {
    return true;
  }
  return false;
}

export function getMissingItemsForPolicy(
  policy: Policy,
  cart: Cart,
  restaurant: Restaurant,
  dealEffect: DealEffectPayload
) {
  // Initialize result object
  const results: {
    missingItems: ItemSpecification[];
    currentQuantity: number;
    quantityNeeded: number;
  }[] = [];

  // Find minimum_quantity conditions
  const quantityConditions = policy.definition.conditions.filter(
    (condition) => condition.type === "minimum_quantity"
  );

  // If no quantity conditions, return empty results
  if (quantityConditions.length === 0) {
    return results;
  }

  // For each quantity condition
  for (const condition of quantityConditions) {
    if (condition.type !== "minimum_quantity") continue;

    let currentQuantity = 0;

    // Count matching items in cart
    for (const cartItem of cart) {
      if (
        ItemUtils.doesItemMeetItemSpecification(
          condition.items,
          cartItem.item,
          restaurant
        ) &&
        !isCartItemAffectedByPolicy(cartItem, dealEffect)
      ) {
        currentQuantity += cartItem.quantity;
      }
    }

    // If we don't have enough items
    if (currentQuantity < condition.quantity) {
      // Add missing items result
      results.push({
        missingItems: condition.items,
        currentQuantity,
        quantityNeeded: condition.quantity - currentQuantity,
      });
    }
  }
  return results;
}
