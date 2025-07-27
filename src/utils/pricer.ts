import { Restaurant, CartItem, Cart, DealEffectPayload } from "../types";
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
    (added) => added.id === cartItem.id
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
    if (cartItem.point_cost > 0) {
      temp["discountDescription"] = `-${formatPoints(
        cartItem.point_cost
      )} points`;
    } else if (cartItem.price == 0) {
      temp["discountDescription"] = "Free Item";
    } else {
      temp["discountDescription"] = `$${(
        ItemUtils.priceItem(cartItem.item, restaurant) - cartItem.price
      ).toFixed(2)} Off`;
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

  switch (modifiedItem.type) {
    case "apply_fixed_discount":
      // Add logic for fixed discount
      temp["discountDescription"] = `$${modifiedItem.amount.toFixed(2)} Off`;
      break;
    case "apply_point_multiplier":
      // Add logic for point multiplier
      temp["discountDescription"] = `x${modifiedItem.amount} points`;
      break;
    case "apply_percent_discount":
      temp["discountDescription"] = `%${(modifiedItem.amount * 100).toFixed(
        0
      )} Off`;
      break;
    case "apply_blanket_price":
      temp["discountDescription"] = `$${(
        temp.oldPrice - temp.currentPrice
      ).toFixed(2)} Off`;
      break;
  }

  return temp;
}

export function priceCartNormally(cart: Cart, restaurant: Restaurant): number {
  let total = 0;
  for (const cartItem of cart) {
    total +=
      (ItemUtils.priceItem(cartItem.item, restaurant) || 0) * cartItem.quantity;
  }
  return total;
}
