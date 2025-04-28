import { Restaurant, CartItem, Item, Cart, DealEffectPayload } from "../types";
import { KNOWN_MODIFIERS } from "@/constants";
import { formatPoints } from "./parse";
import { ItemUtils } from "./item_utils";
export function modifiedItemFlair(
  cartItem: CartItem,
  restaurant: Restaurant,
  dealEffect: DealEffectPayload
): {
  oldPrice: number | null;
  currentPrice: number;
  discountDescription: string | null;
} {
  const modifiedItem = dealEffect.modifiedItems.find(
    (modified) => modified.id === cartItem.id
  );

  const addedItem = dealEffect.addedItems.find(
    (added) => added.cartItem.id === cartItem.id
  );

  const temp: {
    oldPrice: number;
    currentPrice: number;
    discountDescription: string | null;
  } = {
    currentPrice: cartItem.price,
    oldPrice: ItemUtils.priceItem(cartItem.item, restaurant),
    discountDescription: null,
  };

  if (addedItem) {
    if (addedItem.cartItem.point_cost > 0) {
      temp["discountDescription"] = `-${formatPoints(
        addedItem.cartItem.point_cost
      )} points`;
    } else if (addedItem.cartItem.price == 0) {
      temp["discountDescription"] = "Free Item";
    } else {
      temp["discountDescription"] = `$${
        ItemUtils.priceItem(addedItem.cartItem.item, restaurant) -
        addedItem.cartItem.price
      } off`;
    }
    return temp;
  }

  if (!modifiedItem) {
    return {
      oldPrice: null,
      currentPrice: cartItem.price,
      discountDescription: null,
    };
  }

  switch (modifiedItem.modificationType) {
    case "apply_fixed_discount":
      // Add logic for fixed discount
      temp["discountDescription"] = `$${modifiedItem.amount} off`;
      break;
    case "apply_point_multiplier":
      // Add logic for point multiplier
      temp["discountDescription"] = `x${modifiedItem.amount} points`;
      break;
    case "apply_point_cost":
      // Add logic for point cost
      temp["discountDescription"] = `-${formatPoints(
        modifiedItem.amount
      )} points`;
      break;
    case "apply_percent_discount":
      temp["discountDescription"] = `%${(modifiedItem.amount * 100).toFixed(
        0
      )} off`;
      break;
    case "apply_blanket_price":
      temp["discountDescription"] = `$${temp.oldPrice - temp.currentPrice} off`;
      break;
  }

  return temp;
}

export function priceCartNormally(cart: Cart, restaurant: Restaurant): number {
  let total = 0;
  for (const cartItem of cart) {
    total += ItemUtils.priceItem(cartItem.item, restaurant) * cartItem.quantity;
  }
  return total;
}
