import { Restaurant, Item, ItemSpecification, SingleMenuItem } from "@/types";
import { PASS_MENU_TAG, KNOWN_MODIFIERS } from "@/constants";
import { titleCase } from "title-case";

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
      const currentNode = restaurant.menu[currentId];

      if (currentNode?.info?.price) {
        // If it's a leaf node (has a price), add it to our results
        items.push(currentId);
      } else {
        // If not a leaf node, add children to queue to process
        queue.push(...currentNode.children);
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
    const passItems = itemIds.filter((id) => restaurant.menu[id].info.for_date);
    if (passItems.length > 0) {
      passItems.sort((a, b) => {
        const dateA = restaurant.menu[a].info.for_date;
        const dateB = restaurant.menu[b].info.for_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
      // Replace pass items in original array with sorted version
      const nonPassItems = itemIds.filter(
        (id) => !restaurant.menu[id].info.for_date
      );
      itemIds.length = 0;
      itemIds.push(...nonPassItems, ...passItems);
    }
    return itemIds;
  }
  static getItemName(item: Item, restaurant: Restaurant): string {
    return (
      titleCase(restaurant.menu[item.id].info.name) +
      (item.modifiers.length > 0 ? ` (${item.modifiers.join(", ")})` : "")
    );
  }
  static isPassItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId].path.includes(PASS_MENU_TAG);
  }
  static getMenuItemFromItemId(
    itemId: string,
    restaurant: Restaurant
  ): SingleMenuItem | null {
    return restaurant.menu[itemId]?.info;
  }
  static priceItem(item: Item, restaurant: Restaurant): number {
    const { id, modifiers } = item;
    let multiple = modifiers.reduce(
      (acc, modifier) => acc * (KNOWN_MODIFIERS[modifier] || 1),
      1
    );

    const temp = restaurant.menu[id].info;
    if (!temp || !temp.price) {
      throw new Error("Item cannot be priced");
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
}
