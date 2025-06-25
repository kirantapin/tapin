import {
  Restaurant,
  Item,
  ItemSpecification,
  PassItem,
  NormalItem,
  BundleItem,
  Category,
  Cart,
  CartItem,
} from "@/types";
import {
  PASS_MENU_TAG,
  KNOWN_MODIFIERS,
  BUNDLE_MENU_TAG,
  LIQUOR_MENU_TAG,
  HOUSE_MIXER_LABEL,
} from "@/constants";
import { titleCase } from "title-case";
import { PassUtils } from "./pass_utils";
import { BundleUtils } from "./bundle_utils";

export class ItemUtils {
  static getAllItemsInCategory(
    categoryId: string,
    restaurant: Restaurant
  ): string[] {
    //this function is good for passing any arbitrary node id and getting all the tangible items under it
    const items: string[] = [];
    const queue: string[] = [categoryId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = restaurant.menu[currentId] || null;
      if (currentNode) {
        if ("price" in currentNode.info) {
          // If it's a leaf node (has a price), add it to our results
          items.push(currentId);
        } else {
          // If not a leaf node, add children to queue to process
          queue.push(...currentNode.children);
        }
      }
    }

    return items;
  }
  static policyItemSpecificationsToItemIds(
    itemSpecifications: ItemSpecification[],
    restaurant: Restaurant
  ): string[] {
    const itemIds: string[] = [];
    for (const itemSpecification of itemSpecifications) {
      const items = this.getAllItemsInCategory(itemSpecification, restaurant);
      itemIds.push(...items);
    }
    // For pass items, sort by date
    const passItemIds: string[] = itemIds.filter((id) =>
      this.isPassItem(id, restaurant)
    );

    if (passItemIds.length > 0) {
      passItemIds.sort((a, b) => {
        const itemA = restaurant.menu[a].info as PassItem;
        const itemB = restaurant.menu[b].info as PassItem;
        const dateA = itemA.for_date;
        const dateB = itemB.for_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
      // Replace pass items in original array with sorted version
      const nonPassItemIds = itemIds.filter(
        (id) => !this.isPassItem(id, restaurant)
      );
      itemIds.length = 0;
      itemIds.push(...nonPassItemIds, ...passItemIds);
    }
    return itemIds;
  }
  static getItemName(item: Item, restaurant: Restaurant): string {
    const menu = restaurant.menu;
    if (this.isPassItem(item.id, restaurant)) {
      const itemObject = menu[item.id].info as PassItem;
      return titleCase(itemObject.name);
    } else if (this.isLiquorItem(item.id, restaurant)) {
      const path = menu[item.id].path;
      const liquorType = menu[path[path.length - 2]].info.name;
      let liquorBrand: string | null = menu[path[path.length - 1]].info.name;
      if (liquorBrand.toLowerCase().includes("house")) {
        liquorBrand = null;
      }
      const tempModifiers = structuredClone(item.modifiers);
      const mixerIndex = tempModifiers.findIndex((mod) => mod.includes("with"));
      const mixer =
        mixerIndex >= 0 ? tempModifiers.splice(mixerIndex, 1)[0] : undefined;
      let name = "";
      if (mixer) {
        name = `${titleCase(liquorType)} ${mixer || ""}${
          liquorBrand ? `, ${titleCase(liquorBrand)}` : ""
        }`;
      } else {
        name = `Shot of ${titleCase(liquorType)}${
          liquorBrand ? `, ${titleCase(liquorBrand)}` : ""
        }`;
      }
      if (tempModifiers.length > 0) {
        name += `, ${tempModifiers.map((mod) => titleCase(mod)).join(", ")}`;
      }
      return name;
    } else {
      const itemObject = menu[item.id].info as
        | NormalItem
        | BundleItem
        | Category;
      return (
        titleCase(itemObject.name) +
        (item.modifiers.length > 0 ? ` (${item.modifiers.join(", ")})` : "")
      );
    }
  }
  static isPassItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId]?.path?.includes(PASS_MENU_TAG) || false;
  }
  static isBundleItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId]?.path?.includes(BUNDLE_MENU_TAG) || false;
  }
  static isLiquorItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId]?.path?.includes(LIQUOR_MENU_TAG) || false;
  }
  static getMenuItemFromItemId(
    itemId: string,
    restaurant: Restaurant
  ): NormalItem | PassItem | BundleItem | undefined {
    return restaurant.menu[itemId]?.info as
      | NormalItem
      | PassItem
      | BundleItem
      | undefined;
  }
  static priceItem(item: Item, restaurant: Restaurant): number | null {
    const { id, modifiers } = item;
    const multiple = modifiers.reduce(
      (acc, modifier) => acc * (KNOWN_MODIFIERS[modifier] || 1),
      1
    );

    const temp = restaurant.menu[id]?.info;
    if (!temp || !("price" in temp)) {
      return null;
    }

    return temp.price * multiple;
  }
  static doesItemMeetItemSpecification(
    itemSpecs: string[],
    itemInCart: Item,
    restaurant: Restaurant
  ) {
    const path = restaurant.menu[itemInCart.id].path;
    if (!path) {
      return false;
    }
    for (const spec of itemSpecs) {
      if (path.includes(spec)) {
        return true;
      }
    }
    return false;
  }
  static isItemAvailable(
    item: Item,
    restaurant: Restaurant,
    cart: Cart,
    offset: number = 0
  ): string | null {
    const itemInfo = this.getMenuItemFromItemId(item.id, restaurant);
    if (!itemInfo) {
      return "This item is not available";
    }
    if (this.isBundleItem(item.id, restaurant)) {
      const bundleItem = itemInfo as BundleItem;
      if (!BundleUtils.isBundlePurchaseable(bundleItem.object)) {
        return "This item is no longer available";
      }
      return null;
    }
    if (this.isPassItem(item.id, restaurant)) {
      //call isPassInCartAvailable here instead of checking cart uninformed amounts
      const passInCart = PassUtils.isPassInCartAvailable(
        item.id,
        restaurant,
        cart,
        offset
      );
      if (!passInCart.available) {
        return "This pass is not available";
      }
    }
    return null;
  }
  static getCartItemFromId(id: number, cart: Cart): CartItem | null {
    return cart.find((item) => item.id === id) || null;
  }

  static isItemRedeemable(item: Item, restaurant: Restaurant): boolean {
    if (this.isBundleItem(item.id, restaurant)) {
      return false;
    }
    return true;
  }
}
