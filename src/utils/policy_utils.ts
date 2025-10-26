import { ItemSpecification, NormalItem, Policy } from "@/types";
import { Restaurant } from "@/types";
import { supabase } from "./supabase_client";
import { formatPoints, listItemsToStringDescription } from "./parse";
import { ItemUtils } from "./item_utils";
import { titleCase } from "title-case";
import { LOYALTY_REWARD_TAG, MAX_BUNDLE_DURATION } from "@/constants";
import { formatAvailabilityWindow, isAvailableNow } from "./time";

export class PolicyUtils {
  static async fetchPoliciesByRestaurantId(
    restaurantId: string
  ): Promise<Policy[]> {
    const policies = await this.fetch_policies(restaurantId);
    return policies;
  }
  static fetch_policies = async (
    restaurant_id: string | undefined
  ): Promise<Policy[]> => {
    if (!restaurant_id) {
      return [];
    }
    const currentTime = new Date().toISOString();

    const [{ data: unlockedPolicies }, bundlePolicies] = await Promise.all([
      supabase
        .from("policies")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .eq("active", true)
        .eq("locked", false)
        .or(`end_time.gte.${currentTime},end_time.is.null`),
      this.fetchBundlePolicies(restaurant_id),
    ]);

    return [...(unlockedPolicies || []), ...(bundlePolicies || [])];
  };
  static fetchBundlePolicies = async (
    restaurantId: string
  ): Promise<Policy[]> => {
    const maxDaysAgo = new Date(
      Date.now() - MAX_BUNDLE_DURATION * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await supabase
      .from("bundles")
      .select(
        `bundle_id,
        bundle_policy_junction (policies:policy_id (*))
        `
      )
      .eq("restaurant_id", restaurantId)
      .or(`deactivated_at.is.null,deactivated_at.gt.${maxDaysAgo}`)
      .returns<
        {
          bundle_id: string;
          bundle_policy_junction: {
            policies: Policy | null;
          }[];
        }[]
      >();

    if (error) {
      console.error("Error fetching bundle policies:", error);
      return [];
    }

    const bundlePolicies = data
      .flatMap((b) => b.bundle_policy_junction)
      .map((bp) => bp.policies)
      .filter((p): p is Policy => !!p && p.active);

    // Remove duplicate policies based on policy_id
    const uniquePolicies = Array.from(
      new Map(
        bundlePolicies.map((policy) => [policy.policy_id, policy])
      ).values()
    );

    return uniquePolicies;
  };
  static policyToStringDescription = (
    policy: Policy,
    restaurant: Restaurant
  ): { actionDescription: string | null; conditionDescriptions: string[] } => {
    const conditions = policy.definition.conditions;
    const action = policy.definition.action;
    const conditionDescriptions: string[] = (() => {
      const descriptions: string[] = [];
      for (const condition of conditions) {
        switch (condition.type) {
          case "minimum_cart_total":
            descriptions.push(`Minimum cart total of $${condition.amount}`);
            break;
          case "minimum_quantity":
            descriptions.push(
              `At least ${listItemsToStringDescription(
                condition.quantity,
                condition.items,
                null,
                restaurant
              )} in cart`
            );
            break;
          case "minimum_user_points":
            descriptions.push(`User has at least ${condition.amount} points`);
            break;
          case "time_range":
            descriptions.push(
              `Available from ${formatAvailabilityWindow(
                condition.begin_time,
                condition.end_time,
                condition.allowed_days
              )}`
            );
            break;
          default:
            break;
        }
      }
      return descriptions;
    })();

    if (action.priceLimit) {
      conditionDescriptions.push(
        `Valid for items up to $${action.priceLimit.toFixed(2)}`
      );
    }

    const actionDescription: string | null = (() => {
      switch (action.type) {
        case "add_item":
          if (action.free) {
            return `Receive ${listItemsToStringDescription(
              action.quantity,
              action.items,
              "free",
              restaurant
            )}`;
          } else if (action.percentDiscount) {
            return `Get ${(action.percentDiscount * 100).toFixed(
              0
            )}% off on ${listItemsToStringDescription(
              action.quantity,
              action.items,
              null,
              restaurant
            )}`;
          } else if (action.fixedDiscount) {
            return `Get $${action.fixedDiscount.toFixed(
              2
            )} off on ${listItemsToStringDescription(
              action.quantity,
              action.items,
              null,
              restaurant
            )}`;
          } else {
            return null;
          }
        case "apply_percent_discount":
          return `Get ${(action.amount * 100).toFixed(
            0
          )}% off on up to ${listItemsToStringDescription(
            action.maxEffectedItems,
            action.items,
            null,
            restaurant
          )}`;
        case "apply_fixed_discount":
          return `Get $${action.amount.toFixed(
            2
          )} off on up to ${listItemsToStringDescription(
            action.maxEffectedItems,
            action.items,
            null,
            restaurant
          )}`;
        case "apply_point_multiplier":
          return `Earn ${action.amount.toFixed(
            2
          )}x points on up to ${listItemsToStringDescription(
            action.maxEffectedItems,
            action.items,
            null,
            restaurant
          )}`;
        case "apply_order_point_multiplier":
          return `Earn ${action.amount}x points on your entire order`;
        case "apply_fixed_order_discount":
          return `Get a fixed discount of $${action.amount.toFixed(
            2
          )} on your order`;
        case "apply_blanket_price":
          return `$${action.amount.toFixed(2)} total for select items`;
        case "apply_order_percent_discount":
          return `Get a ${(action.amount * 100).toFixed(
            0
          )}% discount on your entire order`;
        case "add_to_user_credit":
          return `Earn $${action.amount.toFixed(2)} of credit`;
        default:
          return null;
      }
    })();

    return { actionDescription, conditionDescriptions };
  };
  static getPolicyFlair(policy: Policy): string {
    const action = policy.definition.action;
    switch (action.type) {
      case "add_item":
        if (action.free) {
          return `${action.quantity} Free Item${
            action.quantity > 1 ? "s" : ""
          }`;
        } else if (action.percentDiscount) {
          return `${(action.percentDiscount * 100).toFixed(0)}% Off`;
        } else if (action.fixedDiscount) {
          return `$${action.fixedDiscount.toFixed(2)} Off`;
        } else {
          return "";
        }
      case "apply_percent_discount":
        return `${(action.amount * 100).toFixed(0)}% Off`;
      case "apply_fixed_discount":
        return `$${action.amount.toFixed(2)} Off`;
      case "apply_point_multiplier":
        return `${action.amount}x Points`;
      case "apply_order_point_multiplier":
        return `${action.amount}x Points on Whole Order`;
      case "apply_fixed_order_discount":
        return `$${action.amount.toFixed(2)} Off Whole Order`;
      case "apply_blanket_price":
        return `$${action.amount.toFixed(2)} Total on Select Items`;
      case "apply_order_percent_discount":
        return `${(action.amount * 100).toFixed(0)}% Off Whole Order`;
      case "add_to_user_credit":
        return `Earn $${action.amount.toFixed(2)} of credit`;
      default:
        return "";
    }
  }

  static getBoundItemCost = (
    itemId: string,
    restaurant: Restaurant,
    bound: "lower" | "upper"
  ): number => {
    const itemInfo = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
    const { variations, modifierGroups } =
      ItemUtils.extractActiveVariationAndModifierGroups(
        itemInfo as NormalItem,
        restaurant
      );

    const variationPrices = variations
      ? Object.values(variations)
          .map((variation) => variation.absolutePrice)
          .sort((a, b) => (bound === "lower" ? a - b : b - a))
      : [];

    const modifierGroupPrices: Record<string, number[]> = modifierGroups
      ? Object.entries(modifierGroups).reduce(
          (acc, [groupId, modifierGroup]) => {
            const sortedDeltas = modifierGroup.modifiers
              .map((modifier) => modifier.delta)
              .sort((a, b) => (bound === "lower" ? a - b : b - a));
            acc[groupId] = sortedDeltas;
            return acc;
          },
          {} as Record<string, number[]>
        )
      : {};

    let startingPrice: number = itemInfo?.price || 0;
    if (variationPrices.length > 0) {
      startingPrice = variationPrices[0];
    }

    for (const [groupId, modifierGroup] of Object.entries(
      modifierGroups ?? {}
    )) {
      const deltas = modifierGroupPrices[groupId];
      if (!deltas || deltas.length === 0) continue;

      if (modifierGroup.select === "single") {
        startingPrice += deltas[0];
      } else if (modifierGroup.select === "multiple") {
        if (bound === "lower") {
          const minCount = modifierGroup.minSelected ?? 0; // keep 0 if explicitly set
          if (minCount > 0) {
            startingPrice += deltas
              .slice(0, minCount)
              .reduce((a, b) => a + b, 0);
          }
        } else {
          const maxAllowed = modifierGroup.modifiers.length;
          const maxCount = Math.min(
            modifierGroup.maxSelected ?? maxAllowed,
            maxAllowed
          );
          if (maxCount > 0) {
            startingPrice += deltas
              .slice(0, maxCount)
              .reduce((a, b) => a + b, 0);
          }
        }
      }
    }

    return startingPrice;
  };

  static getAverageItemCost = (
    itemId: string,
    restaurant: Restaurant
  ): number => {
    const lower = this.getBoundItemCost(itemId, restaurant, "lower");
    const upper = this.getBoundItemCost(itemId, restaurant, "upper");
    return (lower + upper) / 2;
  };

  static returnHighestAverageCostItem = (
    items: ItemSpecification[],
    restaurant: Restaurant
  ): number => {
    //loop through item specifications these could be categories or items so you need to callItemUtils.getAllItemsInCategory to get all items
    //then price all the items and return the price of the most expensive item
    let highestCost = 0;
    for (const item of items) {
      const itemsInCategory = ItemUtils.getAllItemsInCategory(item, restaurant);
      const itemPrice = itemsInCategory.reduce((max, item) => {
        return Math.max(max, this.getAverageItemCost(item, restaurant));
      }, 0);
      if (itemPrice > highestCost) {
        highestCost = itemPrice;
      }
    }
    return parseFloat(highestCost.toFixed(2));
  };
  static getEstimatedPolicyValue = (
    policy: Policy,
    restaurant: Restaurant
  ): number => {
    const action = policy.definition.action;
    let items: ItemSpecification[] = action.items || [];

    switch (action.type) {
      case "add_item":
        let highestCost = this.returnHighestAverageCostItem(items, restaurant);
        highestCost = action.priceLimit || highestCost;
        if (action.free) {
          return highestCost * action.quantity;
        } else if (action.percentDiscount) {
          return highestCost * action.percentDiscount * action.quantity;
        } else if (action.fixedDiscount) {
          return highestCost * action.fixedDiscount * action.quantity;
        } else {
          return 0;
        }
      case "apply_percent_discount":
        items = action.items;
        return (
          this.returnHighestAverageCostItem(items, restaurant) *
          action.amount *
          action.maxEffectedItems
        );

      case "apply_fixed_discount":
        return action.amount * action.maxEffectedItems;
      case "apply_point_multiplier":
        items = action.items;
        return (
          this.returnHighestAverageCostItem(items, restaurant) * action.amount
        );
      case "apply_order_point_multiplier":
        return 0;
      case "apply_fixed_order_discount":
        return action.amount;
      case "apply_blanket_price":
        const totalOriginalPrice = action.items.reduce((sum, itemSpec) => {
          const highestPrice = this.returnHighestAverageCostItem(
            [itemSpec.item],
            restaurant
          );
          return sum + highestPrice * itemSpec.quantity;
        }, 0);
        return totalOriginalPrice - action.amount;

      case "apply_order_percent_discount":
        return 0;
      case "add_to_user_credit":
        return action.amount;
      default:
        return 0;
    }
  };
  static getPolicyName = (policy: Policy, restaurant: Restaurant): string => {
    if (policy.definition.tag === LOYALTY_REWARD_TAG) {
      if (policy.definition.action.type === "add_item") {
        const items = policy.definition.action.items;
        const itemName =
          items.length > 1
            ? "Select Items"
            : titleCase(
                ItemUtils.getMenuItemFromItemId(items[0], restaurant)?.name ||
                  ""
              );
        if (policy.definition.action.free) {
          return `${itemName} for ${formatPoints(
            this.getLoyaltyRewardPoints(policy)
          )} points!`;
        } else if (policy.definition.action.percentDiscount) {
          return `${(policy.definition.action.percentDiscount * 100).toFixed(
            0
          )}% off on ${itemName} for ${formatPoints(
            this.getLoyaltyRewardPoints(policy)
          )} points!`;
        } else if (policy.definition.action.fixedDiscount) {
          return `$${policy.definition.action.fixedDiscount.toFixed(
            2
          )} off on ${itemName} for ${formatPoints(
            this.getLoyaltyRewardPoints(policy)
          )} points!`;
        }
      }
      if (policy.definition.action.type === "add_to_user_credit") {
        return `Earn $${policy.definition.action.amount.toFixed(2)} of credit`;
      }
      return this.getPolicyFlair(policy) || "";
    }
    return titleCase(policy.name || "");
  };
  static getPotentialPreferencesForPolicy = (
    policy: Policy,
    restaurant: Restaurant
  ): string[] => {
    const action = policy.definition.action;
    switch (action.type) {
      case "add_item":
        const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
          action.items,
          restaurant
        );

        return itemIds.filter((id) => {
          const price = ItemUtils.priceItem({ id }, restaurant);
          // Only include if price is not null/undefined and less than priceLimit
          return price != null && price < (action.priceLimit ?? Infinity);
        });

      default:
        return [];
    }
  };
  static getLoyaltyRewardPoints = (policy: Policy): number => {
    for (const condition of policy.definition.conditions) {
      if (condition.type === "minimum_user_points") {
        return condition.amount;
      }
    }
    return 0;
  };
  static getUsageDescription(
    policy: Policy,
    restaurant: Restaurant,
    format: "short" | "long" = "long"
  ): string | null {
    if (!this.isPolicyUsable(policy, restaurant)) {
      return format === "short" ? "Not Active" : "Not Currently Active";
    }
    const { total_usages, days_since_last_use } = policy;

    if (total_usages && days_since_last_use) {
      return format === "short"
        ? `Every${
            days_since_last_use === 1 ? `day` : ` ${days_since_last_use} Days`
          }, ${total_usages} ${total_usages === 1 ? "Use" : "Uses"}`
        : `One use every${
            days_since_last_use === 1 ? `day` : ` ${days_since_last_use} Days`
          } up to ${total_usages} ${total_usages === 1 ? "Use" : "Uses"}`;
    }

    if (total_usages) {
      return format === "short"
        ? `${total_usages} ${total_usages === 1 ? "Use" : "Uses"}`
        : `Up to ${total_usages} ${total_usages === 1 ? "Use" : "Uses"}`;
    }

    if (days_since_last_use) {
      return format === "short"
        ? `Every${
            days_since_last_use === 1 ? `day` : ` ${days_since_last_use} Days`
          }`
        : `One use every${
            days_since_last_use === 1 ? `day` : ` ${days_since_last_use} Days`
          }`;
    }

    return null;
  }
  static isPolicyUsable = (policy: Policy, restaurant: Restaurant): boolean => {
    const { action, conditions } = policy.definition;

    for (const condition of conditions) {
      if (condition.type === "minimum_quantity") {
        const itemSpecs = condition.items;
        const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
          itemSpecs,
          restaurant
        );

        const itemAvailabilities = itemIds.map((id) =>
          ItemUtils.isItemUnavailable({ id }, restaurant)
        );

        if (!itemAvailabilities.includes(null)) {
          return false;
        }
      }
      if (condition.type === "time_range") {
        if (!isAvailableNow(condition, restaurant.metadata.timeZone)) {
          return false;
        }
      }
    }

    if (action.type === "apply_blanket_price") {
      for (const item of action.items) {
        const itemIds = ItemUtils.getAllItemsInCategory(item.item, restaurant);
        if (
          itemIds
            .map(
              (id) => ItemUtils.isItemUnavailable({ id }, restaurant) !== null
            )
            .every(Boolean)
        ) {
          return false;
        }
      }
    } else {
      if ("items" in action) {
        const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
          action.items,
          restaurant
        );

        const itemAvailabilities = itemIds.map((id) =>
          ItemUtils.isItemUnavailable({ id }, restaurant)
        );
        if (!itemAvailabilities.includes(null)) {
          return false;
        }
      }
    }
    return true;
  };
  static getAllUsablePolicies = (
    policies: Policy[],
    restaurant: Restaurant
  ): Policy[] => {
    return policies.filter((policy) => this.isPolicyUsable(policy, restaurant));
  };
}
