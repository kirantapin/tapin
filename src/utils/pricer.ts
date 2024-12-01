import { Restaurant, CartItem, DrinkMenu, Menu, Item } from "../types";

// Example method to demonstrate functionality
export function priceItem(item: Item, restaurant: Restaurant): number {
  const termMapping: Record<string, string> = {
    "Specialty Options": "specialty_option",
    "Beer and Cider": "beer_and_cider",
    "Classic Cocktail": "classic_cocktail",
    rum: "rum",
    vodka: "vodka",
    tequila: "tequila",
  };
  if (item.item === "drink" && item.category) {
    const drink_menu = restaurant.menu["drink"];
    if (
      item.category !== "House Mixer" &&
      item.category !== "Shot or Shooter"
    ) {
      const category_menu =
        drink_menu[
          termMapping[item.category] as keyof Omit<DrinkMenu, "liquor">
        ];
      if (!item.name) {
        console.log("not enough info to price");
        return 0;
      }
      console.log(drink_menu);
      console.log(category_menu);
      return category_menu[item.name] as number;
    } else {
      if (item.liquorType) {
        const liquor_type_menu = drink_menu.liquor[item.liquorType];
        const liquorBrand = item.liquorBrand || liquor_type_menu.default;
        return liquor_type_menu[liquorBrand] as number;
      } else {
        //return default liquor price
        return drink_menu.liquor["default"] as number;
      }
    }
  } else {
    return restaurant.menu[item.item as keyof Menu] as number;
  }
}
