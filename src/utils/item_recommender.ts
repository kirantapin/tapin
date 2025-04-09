import { Cart, Policy, ItemSpecification } from "@/types";
import { isEqual } from "lodash";
/**
 * Analyzes a user's cart against a policy to determine what items are missing to qualify
 *
 * @param policy - The policy to check against
 * @param cart - The user's current cart
 * @returns Object containing qualification status and missing items
 */
export function getMissingItemsForPolicy(policy: Policy, cart: Cart) {
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
      for (const itemSpec of condition.items) {
        if (
          itemSpec.every((item, index) => cartItem.item.path[index] === item)
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

  return results;
}
