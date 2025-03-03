import { Restaurant, CartItem, DrinkMenu, Menu, Item } from "../types";

export function priceItem(item: Item, restaurant: Restaurant): number {
  let menu = restaurant.menu;
  const liquorMenu = menu["drink"]["shots_or_shooters"];
  for (let i = 0; i < item.length; i++) {
    if (item[i] in menu) {
      menu = menu[item[i]];
    } else {
      throw new Error("Item cannot be priced");
    }
  }
  if (typeof menu === "number") {
    return menu;
  }

  if (typeof menu === "string") {
    const liquorType = item[item.length - 2];
    return liquorMenu[liquorType][menu];
  }
  throw new Error("Item cannot be priced");
}
