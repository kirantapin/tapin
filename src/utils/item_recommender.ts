import { ADD_ON_TAG } from "@/constants";
import {
  Cart,
  Policy,
  ItemSpecification,
  Restaurant,
  CartItem,
  DealEffectPayload,
} from "@/types";
import { isEqual } from "lodash";
/**
 * Analyzes a user's cart against a policy to determine what items are missing to qualify
 *
 * @param policy - The policy to check against
 * @param cart - The user's current cart
 * @returns Object containing qualification status and missing items
 */

function doesCartItemMeetItemSpec(
  cartItem: CartItem,
  itemSpec: ItemSpecification,
  restaurant: Restaurant
) {
  const path = restaurant.menu[cartItem.item.id].path;
  return path.includes(itemSpec);
}

function isCartItemAffectedByPolicy(
  cartItem: CartItem,
  dealEffect: DealEffectPayload
) {
  console.log(dealEffect);
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
  if (policy.definition.tag === ADD_ON_TAG) {
    console.log(policy);
  }
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
      for (const itemSpec of condition.items) {
        if (
          doesCartItemMeetItemSpec(cartItem, itemSpec, restaurant) &&
          !isCartItemAffectedByPolicy(cartItem, dealEffect)
        ) {
          currentQuantity += cartItem.quantity;
        }
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
  if (policy.definition.tag === ADD_ON_TAG) {
    console.log(results);
  }
  return results;
}
