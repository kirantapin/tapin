import { ItemSpecification, Policy } from "@/types";
import { Restaurant } from "@/types";
import { supabase } from "./supabase_client";
import { formatPoints, listItemsToStringDescription } from "./parse";
import { ItemUtils } from "./item_utils";

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

    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .or(
        `and(begin_time.lte.${currentTime},end_time.gte.${currentTime}),and(begin_time.is.null,end_time.is.null)`
      );
    if (error) {
      console.error("Error fetching data:", error);
      return [];
    } else {
      return data;
    }
  };
  static policyToStringDescription = (
    policy: Policy,
    restaurant: Restaurant
  ) => {
    const conditions = policy.definition.conditions;
    const action = policy.definition.action;
    const conditionDescriptions = conditions.map((condition) => {
      switch (condition.type) {
        case "minimum_cart_total":
          return `Minimum cart total of $${condition.amount}`;
        case "minimum_quantity":
          return `At least ${listItemsToStringDescription(
            condition.quantity,
            condition.items,
            null,
            restaurant
          )} in cart`;
        case "minimum_user_points":
          return `User has at least ${condition.amount} points`;
        case "time_range":
          return `Available from ${condition.begin_time} to ${
            condition.end_time
          } on ${condition.allowed_days.join(", ")}`;
        default:
          return [];
      }
    });

    const actionDescription = (() => {
      switch (action.type) {
        case "add_free_item":
          return `Receive ${listItemsToStringDescription(
            action.quantity,
            [action.item],
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
        case "apply_point_cost":
          return `Up to ${listItemsToStringDescription(
            action.maxEffectedItems,
            action.items,
            null,
            restaurant
          )} can be redeemed for ${action.amount} points each`;
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
      case "apply_point_cost":
        return `Redeem for ${formatPoints(action.amount)} Points`;
      case "apply_order_point_multiplier":
        return `${action.amount}x Points on Whole Order`;
      case "apply_fixed_order_discount":
        return `$${action.amount} Off Whole Order`;
      case "apply_blanket_price":
        return `$${action.amount} Total on Select Items`;
      case "apply_order_percent_discount":
        return `${(action.amount * 100).toFixed(0)}% Off Whole Order`;
      case "apply_loyalty_reward":
        return `Redeem for ${formatPoints(action.amount)} Points`;
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
    const items: ItemSpecification[] = policy.definition.action.items || [
      policy.definition.action.item,
    ];
    switch (action.type) {
      case "add_free_item":
        return this.returnHighestCostItem(items, restaurant) * action.quantity;
      case "apply_percent_discount":
        return (
          this.returnHighestCostItem(items, restaurant) *
          action.amount *
          action.maxEffectedItems
        );

      case "apply_fixed_discount":
        return action.amount * action.maxEffectedItems;
      case "apply_point_multiplier":
        return this.returnHighestCostItem(items, restaurant) * action.amount;
      case "apply_point_cost":
        return (
          this.returnHighestCostItem(items, restaurant) *
          action.amount *
          action.maxEffectedItems
        );
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
      case "apply_loyalty_reward":
        return this.returnHighestCostItem(items, restaurant);
      default:
        return 0;
    }
  };
}
