import { rest } from "lodash";
import {
  Restaurant,
  CartItem,
  DrinkMenu,
  Menu,
  Item,
  Cart,
  ModifiedCartItem,
  DealEffectPayload,
} from "../types";
import { KNOWN_MODIFIERS, MENU_DISPLAY_MAP } from "@/constants";

export function priceCartNormally(cart: Cart, restaurant: Restaurant): number {
  let total = 0;
  for (const cartItem of cart) {
    total += priceItem(cartItem.item, restaurant) * cartItem.quantity;
  }
  return total;
}

export function priceItem(item: Item, restaurant: Restaurant): number {
  const { path, modifiers } = item;
  let multiple = modifiers.reduce(
    (acc, modifier) => acc * (KNOWN_MODIFIERS[modifier] || 1),
    1
  );
  let menu: any = structuredClone(restaurant.menu);
  const temp = path.reduce(
    (acc, key) => (acc && acc[key] ? acc[key] : undefined),
    menu
  );
  if (!temp || !temp.price) {
    throw new Error("Item cannot be priced");
  }

  return temp.price * multiple;
}

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

  if (!modifiedItem) {
    return {
      oldPrice: null,
      currentPrice: cartItem.price,
      discountDescription: null,
    };
  }

  const temp: {
    oldPrice: number;
    currentPrice: number;
    discountDescription: string | null;
  } = {
    currentPrice: cartItem.price,
    oldPrice: priceItem(cartItem.item, restaurant),
    discountDescription: null,
  };
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
      temp["discountDescription"] = `-${modifiedItem.amount} points`;
      break;
    case "apply_percent_discount":
      temp["discountDescription"] = `%${modifiedItem.amount} off`;
      break;
  }

  return temp;
}
