import { Restaurant, CartItem, DrinkMenu, Menu, Item } from "../types";
import { KNOWN_MODIFIERS, MENU_DISPLAY_MAP } from "@/constants";

export function priceItem(item: Item, restaurant: Restaurant): number {
  const { path, modifiers } = item;
  let multiple = modifiers.reduce(
    (acc, modifier) => acc * (KNOWN_MODIFIERS[modifier] || 1),
    1
  );
  let menu: any = structuredClone(restaurant.menu);
  const liquorMenu = menu["drink"]["shots_or_shooters"];
  const temp = path.reduce(
    (acc, key) => (acc && acc[key] ? acc[key] : undefined),
    menu
  );
  if (!temp) {
    throw new Error("Item cannot be priced");
  }
  if (typeof temp === "number") {
    return temp * multiple;
  }

  if (typeof temp === "string") {
    const liquorType = path[path.length - 2];
    return liquorMenu[liquorType][temp] * multiple;
  }
  throw new Error("Item cannot be priced");
}
