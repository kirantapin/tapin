import {
  Cart,
  CartItem,
  DealEffectPayload,
  Item,
  ModifiedCartItem,
  PolicyDefinition,
  Restaurant,
  WholeCartModification,
} from "../types.ts";
import { priceItem } from "./pricer.ts";

function doesArrayInclude(itemList: Item[], item: Item) {
  for (const dealItem of itemList) {
    let noMatch = false;
    for (const key in dealItem) {
      const typedKey = key as keyof Item;
      if (!(key in item && item[typedKey] === dealItem[typedKey])) {
        noMatch = true;
      }
    }
    if (!noMatch) {
      return true;
    }
  }
  return false;
}

export function qualifiesForDeal(
  cart: Cart,
  deal: PolicyDefinition,
  restaurant: Restaurant
): boolean {
  const cartTotal = cart.reduce(
    (sum: number, item: CartItem) =>
      sum + priceItem(item.item, restaurant) * item.quantity,
    0
  );

  const cartTotalQuantity = cart.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  for (const condition of deal.conditions || []) {
    if (condition.type === "minimum_quantity") {
      // Check if the total quantity of specified items meets the condition
      const totalQuantity = cart
        .filter(
          (item: CartItem) =>
            condition.items && doesArrayInclude(condition.items, item.item)
        )
        .reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      if (totalQuantity < condition.quantity) {
        console.log(
          `Deal does not apply: You need at least ${
            condition.quantity
          } of ${condition.items.join(
            ", "
          )} in your cart, but you only have ${totalQuantity}.`
        );
        return false;
      }
    }

    if (condition.type === "exact_quantity") {
      // Check if the total quantity of specified items meets the condition
      const totalQuantity = cart
        .filter(
          (item: CartItem) =>
            condition.items && doesArrayInclude(condition.items, item.item)
        )
        .reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      if (totalQuantity !== condition.quantity) {
        console.log(
          `Deal does not apply: You need at least ${
            condition.quantity
          } of ${condition.items.join(
            ", "
          )} in your cart, but you only have ${totalQuantity}.`
        );
        return false;
      }
    }

    if (condition.type === "minimum_cart_total") {
      // Check if the total cart value meets the condition
      if (cartTotal < condition.amount) {
        console.log(
          `Deal does not apply: Your cart total is $${cartTotal}, but it needs to be at least $${condition.amount}.`
        );
        return false;
      }
    }
    if (condition.type === "total_quantity") {
      // Check if the total quantity in the cart matches the condition
      if (cartTotalQuantity !== condition.quantity) {
        console.log(
          `Deal does not apply: Your cart contains ${cartTotalQuantity} items, but it must contain exactly ${condition.quantity} items.`
        );
        return false;
      }
    }
  }

  return true; // Passes all conditions
}

export function applyDeal(
  cart: Cart,
  deal: PolicyDefinition,
  restaurant: Restaurant
): DealEffectPayload {
  if (!qualifiesForDeal(cart, deal, restaurant)) {
    return {
      freeAddedItems: [],
      modifiedItems: [],
      wholeCartModification: null,
    };
  }

  const updatedCart = structuredClone(cart);
  const dealEffectPayload: DealEffectPayload = {
    freeAddedItems: [],
    modifiedItems: [],
    wholeCartModification: null,
  };
  const action = deal.action;
  if (action.type === "add_free_item") {
    const temp = {
      item: action.item.item,
      category: action.item.category,
    };
    dealEffectPayload.freeAddedItems.push({
      item: temp,
      quantity: action.quantity,
    });
  } else if (action.type === "apply_percent_discount") {
    // apply a percentage discount to specific items(or all items if action.itemIds is not defined) up to a maximum number of items specified by deal
    let discountedItems = 0;
    cart.forEach((item: CartItem, index: number) => {
      if (
        (!action.items ||
          action.items.length === 0 ||
          doesArrayInclude(action.items, item.item)) &&
        discountedItems < (action.maxEffectedItems || Infinity)
      ) {
        const itemsToDiscount = Math.min(
          item.quantity,
          action.maxEffectedItems - discountedItems
        ); // How many items can still be discounted?

        if (itemsToDiscount > 0) {
          const temp: ModifiedCartItem = {
            id: item.id,
            modificationType: "apply_percent_discount",
            amount: action.amount,
            quantity: itemsToDiscount,
          };

          dealEffectPayload.modifiedItems.push(temp);

          // Update the counter for how many items have been discounted
          discountedItems += itemsToDiscount;
        }
      }
    });
  } else if (action.type === "apply_fixed_discount") {
    //the purpose is to apply a fixed discount amount to specific items(or all items) up to a max number of discounted items.
    let discountedItems = 0;
    cart.forEach((item: CartItem, index: number) => {
      if (
        (!action.items ||
          action.items.length === 0 ||
          doesArrayInclude(action.items, item.item)) &&
        discountedItems < (action.maxEffectedItems || Infinity)
      ) {
        const itemsToDiscount = Math.min(
          item.quantity,
          action.maxEffectedItems - discountedItems
        ); // How many items can still be discounted?

        if (itemsToDiscount > 0) {
          // Reduce the original item quantity

          const temp: ModifiedCartItem = {
            id: item.id,
            modificationType: "apply_fixed_discount",
            amount: action.amount,
            quantity: itemsToDiscount,
          };

          dealEffectPayload.modifiedItems.push(temp);

          discountedItems += itemsToDiscount;
        }
      }
    });
  } else if (action.type === "apply_point_multiplier") {
    let multipliedItems = 0;

    cart.forEach((item: CartItem, index: number) => {
      if (
        (!action.items || doesArrayInclude(action.items, item.item)) &&
        multipliedItems < (action.maxEffectedItems || Infinity)
      ) {
        // Determine how many items can receive the multiplier
        const itemsToMultiply = Math.min(
          item.quantity,
          action.maxEffectedItems - multipliedItems
        );

        if (itemsToMultiply > 0) {
          // Reduce the original item's quantity
          const temp: ModifiedCartItem = {
            id: item.id,
            modificationType: "apply_point_multiplier",
            amount: action.amount,
            quantity: itemsToMultiply,
          };

          dealEffectPayload.modifiedItems.push(temp);

          multipliedItems += itemsToMultiply;
        }
      }
    });
  } else if (action.type === "apply_fixed_order_discount") {
    const temp: WholeCartModification = {
      modificationType: "apply_fixed_order_discount",
      amount: action.amount,
    };
    dealEffectPayload.wholeCartModification = temp;
  } else if (action.type === "apply_order_point_multiplier") {
    const temp: WholeCartModification = {
      modificationType: "apply_order_point_multiplier",
      amount: action.amount,
    };
    dealEffectPayload.wholeCartModification = temp;
  } else if (action.type === "apply_order_percent_discount") {
    const temp: WholeCartModification = {
      modificationType: "apply_order_percent_discount",
      amount: action.amount,
    };
    dealEffectPayload.wholeCartModification = temp;
  } else if (action.type === "apply_blanket_price") {
    const temp: WholeCartModification = {
      modificationType: "apply_blanket_price",
      amount: action.amount,
    };
    dealEffectPayload.wholeCartModification = temp;
  }

  return dealEffectPayload;
}
