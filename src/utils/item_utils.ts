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
  ModifierGroup,
} from "@/types";
import { PASS_MENU_TAG, BUNDLE_MENU_TAG } from "@/constants";
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
    const { variation } = item;
    if (this.isPassItem(item.id, restaurant)) {
      const itemObject = menu[item.id].info as PassItem;
      return titleCase(itemObject.name);
    } else {
      const itemObject = menu[item.id].info as
        | NormalItem
        | BundleItem
        | Category;
      return titleCase(itemObject.name);
    }
  }
  static isPassItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId]?.path?.includes(PASS_MENU_TAG) || false;
  }
  static isBundleItem(itemId: string, restaurant: Restaurant): boolean {
    return restaurant.menu[itemId]?.path?.includes(BUNDLE_MENU_TAG) || false;
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
  static priceItem(item: Item, restaurant: Restaurant): number {
    const { id, variation, modifiers } = item;
    const temp = restaurant.menu[id]?.info;

    if (!temp || temp.price == null) {
      throw new Error("Item cannot be priced");
    }
    let startingPrice = temp.price;

    if (variation) {
      const variationInfo = (temp as NormalItem)?.variations?.[variation];
      if (variationInfo) {
        startingPrice = variationInfo.absolutePrice;
      }
    }

    for (const [modifierGroupId, modifierIds] of Object.entries(
      modifiers || {}
    )) {
      const modifierGroup = restaurant.modifier_groups[modifierGroupId];
      if (!modifierGroup) {
        continue;
      }
      for (const modifierId of modifierIds) {
        const modifier = modifierGroup.modifiers.find(
          (mod) => mod.id === modifierId
        );
        if (!modifier) {
          continue;
        } else {
          startingPrice += modifier.delta;
        }
      }
    }

    return startingPrice;
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
  static isItemUnavailable(
    item: Item,
    restaurant: Restaurant,
    cart: Cart = [],
    offset: number = 0
  ): string | null {
    const itemInfo = this.getMenuItemFromItemId(item.id, restaurant);
    if (!itemInfo || !("price" in itemInfo)) {
      return "This item is not available";
    }
    if ("archived" in itemInfo && itemInfo.archived) {
      return "This item is no longer available";
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
    if (this.isPassItem(item.id, restaurant)) {
      return this.isItemUnavailable(item, restaurant) === null;
    }
    return !!this.getMenuItemFromItemId(item.id, restaurant);
  }

  static extractActiveVariationAndModifierGroups(
    itemInfo: NormalItem,
    restaurant: Restaurant
  ): {
    variations: Record<
      string,
      {
        sourceId: string | null;
        name: string;
        absolutePrice: number;
        archived?: boolean;
      }
    > | null;
    modifierGroups: Record<string, ModifierGroup>;
  } {
    const { variations, modifierGroups } = itemInfo as NormalItem;
    // Filter out archived variations
    let activeVariations: Record<
      string,
      {
        sourceId: string | null;
        name: string;
        absolutePrice: number;
        archived?: boolean;
      }
    > | null = null;
    if (variations) {
      activeVariations = Object.fromEntries(
        Object.entries(variations).filter(
          ([_, variation]) => !variation.archived
        )
      );
    }

    // Filter out archived modifier groups and their modifiers
    let activeModifierGroupIds: string[] = [];
    if (modifierGroups) {
      activeModifierGroupIds = modifierGroups.filter((groupId) => {
        const group = restaurant.modifier_groups[groupId];
        return group && !group.archived;
      });
    }

    // Filter out archived modifiers from selected modifiers
    const activeModifierGroups: Record<string, ModifierGroup> = {};
    for (const groupId of activeModifierGroupIds) {
      const group = restaurant.modifier_groups[groupId];
      const activeModifiersInGroup = group.modifiers.filter(
        (modifier) => !modifier.archived
      );
      if (activeModifiersInGroup.length > 0) {
        activeModifierGroups[groupId] = {
          ...group,
          modifiers: activeModifiersInGroup,
        };
      }
    }

    return {
      variations: activeVariations,
      modifierGroups: activeModifierGroups,
    };
  }

  static doesItemRequireConfiguration(
    item: Item,
    restaurant: Restaurant
  ): string | null {
    const itemInfo = this.getMenuItemFromItemId(item.id, restaurant);
    if (!itemInfo) {
      return "Item not found";
    }

    const { variations, modifierGroups } =
      this.extractActiveVariationAndModifierGroups(
        itemInfo as NormalItem,
        restaurant
      );
    const selectedVariation = item.variation;

    if (variations) {
      if (Object.keys(variations).length === 0) {
        item.variation = null;
      } else if (Object.keys(variations).length === 1) {
        item.variation = Object.keys(variations)[0];
      } else if (selectedVariation) {
        if (!variations[selectedVariation]) {
          return "Item requires a valid variation";
        }
      } else {
        return "Item requires a variation selection";
      }
    } else {
      item.variation = null;
    }

    // Check modifiers based on ModifierGroup specifications
    if (modifierGroups && Object.keys(modifierGroups).length > 0) {
      if (!item.modifiers) {
        //Even though in a lot of cases it is fine if modifiers is null, if there are active modifier groups we want to give the user the option to select them
        const defaults: Record<string, string[]> = {};
        Object.keys(modifierGroups).forEach((groupId) => {
          const group = modifierGroups[groupId];
          if (group && group.defaults.length > 0) {
            defaults[groupId] = [...group.defaults];
          }
        });
        item.modifiers = defaults;
        return "Item requires modifier selections";
      }

      for (const selectedModifierGroupId of Object.keys(item.modifiers)) {
        if (!modifierGroups[selectedModifierGroupId]) {
          return `Invalid modifier selection`;
        }
      }

      for (const [modifierGroupId, modifierGroup] of Object.entries(
        modifierGroups
      )) {
        if (!modifierGroup) {
          console.warn(
            `Modifier group ${modifierGroupId} not found in restaurant`
          );
          continue;
        }

        const selectedModifiers = item.modifiers[modifierGroupId] || [];

        // Validate that selected modifiers exist in the modifier group
        if (selectedModifiers && selectedModifiers.length > 0) {
          const validModifierIds = modifierGroup.modifiers.map((mod) => mod.id);
          for (const selectedModId of selectedModifiers) {
            if (!validModifierIds.includes(selectedModId)) {
              console.log("Invalid modifier selection", selectedModId);
              return `Invalid modifier selection in ${modifierGroup.name}`;
            }
          }
        }

        if (modifierGroup.select === "single") {
          if (selectedModifiers.length === 0) {
            return `One selection required for ${titleCase(
              modifierGroup.name
            )}`;
          }
          if (selectedModifiers.length > 1) {
            return `Only one allowed for ${titleCase(modifierGroup.name)}`;
          }
        } else if (modifierGroup.select === "multiple") {
          if (
            modifierGroup.minSelected &&
            selectedModifiers.length < modifierGroup.minSelected
          ) {
            return `Minimum of ${modifierGroup.minSelected} selection${
              modifierGroup.minSelected > 1 ? "s" : ""
            } from ${modifierGroup.name}`;
          }

          // Check maximum selection requirements
          if (
            modifierGroup.maxSelected &&
            selectedModifiers.length > modifierGroup.maxSelected
          ) {
            return `Maximum of ${modifierGroup.maxSelected} selection${
              modifierGroup.maxSelected > 1 ? "s" : ""
            } from ${modifierGroup.name}`;
          }
        }
      }
    }

    return null;
  }

  static getItemModifierNames(item: Item, restaurant: Restaurant): string[] {
    const itemInfo = this.getMenuItemFromItemId(item.id, restaurant);
    if (!itemInfo) {
      return [];
    }

    const names: string[] = [];

    // Add variation name if it exists
    if (item.variation && "variations" in itemInfo && itemInfo.variations) {
      const variation = itemInfo.variations[item.variation];
      if (variation) {
        names.push(titleCase(variation.name));
      }
    }

    // Add selected modifier names if they exist
    if (
      "modifierGroups" in itemInfo &&
      itemInfo.modifierGroups &&
      item.modifiers
    ) {
      itemInfo.modifierGroups.forEach((modifierGroupId) => {
        const modifierGroup = restaurant.modifier_groups[modifierGroupId];
        const selectedModifiers = item.modifiers?.[modifierGroupId] || [];

        if (
          modifierGroup &&
          selectedModifiers &&
          selectedModifiers.length > 0
        ) {
          selectedModifiers.forEach((selectedModifierId) => {
            const modifier = modifierGroup.modifiers.find(
              (mod) => mod.id === selectedModifierId
            );
            if (modifier) {
              names.push(titleCase(modifier.name));
            }
          });
        }
      });
    }

    return names;
  }
}
