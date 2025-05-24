import { ItemSpecification, Policy } from "@/types";
import { Restaurant } from "@/types";
import { supabase } from "./supabase_client";
import { formatPoints, listItemsToStringDescription } from "./parse";
import { ItemUtils } from "./item_utils";
import { titleCase } from "title-case";
import { LOYALTY_REWARD_TAG } from "@/constants";
import { formatAvailabilityWindow } from "./time";

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
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days
    ).toISOString();
    const { data, error } = await supabase
      .from("bundles")
      .select(
        `bundle_id,
        bundle_policy_junction (policies:policy_id (*))
        `
      )
      .eq("restaurant_id", restaurantId)
      .or(`deactivated_at.is.null,deactivated_at.gt.${ninetyDaysAgo}`)
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
                condition.allowed_days,
                restaurant.metadata.timeZone as string
              )}`
            );
            break;
          default:
            break;
        }
      }
      return descriptions;
    })();

    const actionDescription: string | null = (() => {
      switch (action.type) {
        case "add_free_item":
          return `Receive ${listItemsToStringDescription(
            action.quantity,
            action.items,
            "free",
            restaurant
          )}`;
        //Get 30 % off on up to 3 orders of either item or item or item
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
      case "add_free_item":
        return `${action.quantity} Free Item${action.quantity > 1 ? "s" : ""}`;
      case "apply_percent_discount":
        return `${(action.amount * 100).toFixed(0)}% Off`;
      case "apply_fixed_discount":
        return `$${action.amount.toFixed(2)} Off`;
      case "apply_point_multiplier":
        return `${action.amount}x Points`;
      case "apply_order_point_multiplier":
        return `${action.amount}x Points on Whole Order`;
      case "apply_fixed_order_discount":
        return `$${action.amount} Off Whole Order`;
      case "apply_blanket_price":
        return `$${action.amount} Total on Select Items`;
      case "apply_order_percent_discount":
        return `${(action.amount * 100).toFixed(0)}% Off Whole Order`;
      case "add_to_user_credit":
        return `Earn $${action.amount.toFixed(2)} of credit`;
      default:
        return "";
    }
  }
  static returnHighestCostItem = (
    items: ItemSpecification[],
    restaurant: Restaurant
  ): number => {
    //loop through item specifications these could be categories or items so you need to callItemUtils.getAllItemsInCategory to get all items
    //then price all the items and return the price of the most expensive item
    let highestCost = 0;
    for (const item of items) {
      const itemsInCategory = ItemUtils.getAllItemsInCategory(item, restaurant);
      const itemPrice = itemsInCategory.reduce((max, item) => {
        return Math.max(
          max,
          ItemUtils.priceItem({ id: item, modifiers: [] }, restaurant) || 0
        );
      }, 0);
      if (itemPrice > highestCost) {
        highestCost = itemPrice;
      }
    }
    return highestCost;
  };
  static getEstimatedPolicyValue = (
    policy: Policy,
    restaurant: Restaurant
  ): number => {
    const action = policy.definition.action;
    let items: ItemSpecification[] = [];

    switch (action.type) {
      case "add_free_item":
        items = action.items;
        return this.returnHighestCostItem(items, restaurant) * action.quantity;
      case "apply_percent_discount":
        items = action.items;
        return (
          this.returnHighestCostItem(items, restaurant) *
          action.amount *
          action.maxEffectedItems
        );

      case "apply_fixed_discount":
        return action.amount * action.maxEffectedItems;
      case "apply_point_multiplier":
        items = action.items;
        return this.returnHighestCostItem(items, restaurant) * action.amount;
      case "apply_order_point_multiplier":
        return 0;
      case "apply_fixed_order_discount":
        return action.amount;
      case "apply_blanket_price":
        const totalOriginalPrice = action.items.reduce((sum, itemSpec) => {
          const highestPrice = this.returnHighestCostItem(
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
      if (policy.definition.action.type === "add_free_item") {
        return `${titleCase(
          ItemUtils.getMenuItemFromItemId(
            policy.definition.action.items[0],
            restaurant
          )?.name || ""
        )} for ${formatPoints(this.getLoyaltyRewardPoints(policy))} points!`;
      }
      if (policy.definition.action.type === "add_to_user_credit") {
        return `Earn $${policy.definition.action.amount.toFixed(2)} of credit`;
      }
    }
    return titleCase(policy.name || "");
  };
  static getUserChoicesForPolicy = (
    policy: Policy,
    restaurant: Restaurant
  ): string[] => {
    const action = policy.definition.action;
    switch (action.type) {
      case "add_free_item":
        return ItemUtils.policyItemSpecificationsToItemIds(
          action.items,
          restaurant
        );
      case "apply_add_on":
        return ItemUtils.policyItemSpecificationsToItemIds(
          action.items,
          restaurant
        );
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
  static getUsageDescription(policy: Policy): string | null {
    const { total_usages, days_since_last_use } = policy;

    if (total_usages && days_since_last_use) {
      return `One use every ${days_since_last_use} ${
        days_since_last_use === 1 ? "day" : "days"
      } up to ${total_usages} ${total_usages === 1 ? "use" : "uses"}`;
    }

    if (total_usages) {
      return `Up to ${total_usages} ${total_usages === 1 ? "use" : "uses"}`;
    }

    if (days_since_last_use) {
      return `Single use every ${days_since_last_use} ${
        days_since_last_use === 1 ? "day" : "days"
      }`;
    }

    return null;
  }
}
