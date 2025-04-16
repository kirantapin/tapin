import { PASS_MENU_TAG } from "@/constants";
import { Item, ItemSpecification, Policy, Restaurant } from "@/types";
import { titleCase } from "title-case";

export const itemToStringDescription = (item: Item, restaurant: Restaurant) => {
  return titleCase(restaurant.menu[item.id].info.name);
};

const listItemsToStringDescription = (
  quantity: number,
  items: string[],
  injectWord: string | null = null,
  restaurant: Restaurant
) => {
  if (items.length > 1) {
    const itemNames = items
      .map((item) =>
        itemToStringDescription({ id: item, modifiers: [] }, restaurant)
      )
      .join(" or ");
    return `${quantity} ${
      injectWord ? injectWord + " " : ""
    }orders of either ${itemNames}`;
  } else if (items.length === 1) {
    const itemName = itemToStringDescription(
      { id: items[0], modifiers: [] },
      restaurant
    );
    return `${quantity} ${injectWord ? injectWord + " " : ""}${itemName}${
      quantity > 1 ? "s" : ""
    }`;
  } else {
    return "";
  }
};

export const policyToStringDescription = (
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

function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertUtcToLocal(utcTimestampz: string): string {
  const timeZone = getLocalTimeZone();
  const date = new Date(utcTimestampz);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: undefined,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: undefined,
  }).format(date);
}

export function convertLocalToUtcTimestampz(localDateStr: string): string {
  const timeZone = getLocalTimeZone();
  const dateInLocal = new Date(
    new Date(localDateStr).toLocaleString("en-US", { timeZone })
  );
  return new Date(
    dateInLocal.getTime() - dateInLocal.getTimezoneOffset() * 60000
  ).toISOString();
}

export function sentenceCase(text: string) {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
}

export function getPolicyFlair(policy: Policy): string {
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

export function keywordExtraction(
  item: ItemSpecification,
  restaurant: Restaurant
): string[] {
  const keywords: string[] = [];

  // Get the full path by traversing the menu object
  const path = restaurant.menu[item].path;
  for (const segment of path) {
    const name = restaurant.menu[segment].info.name;
    keywords.push(
      name
        .toLowerCase()
        .split(/[\s\-_]+/) // Split on spaces, hyphens and underscores
        .filter((word) => word.length > 2) // Filter out very short words
        .map((word) => word.trim())
    );
  }

  // Remove duplicates
  const uniqueKeywords = [...new Set(keywords)];

  // Filter out common words that aren't useful for search
  const stopWords = ["the", "and", "with", "for", "from"];
  return uniqueKeywords.filter((word) => !stopWords.includes(word));
}

export const formatPoints = (points: number) => {
  if (points >= 1000) {
    if (points % 1000 === 0) {
      return `${points / 1000}K`;
    } else {
      return `${(points / 1000).toFixed(1)}K`;
    }
  }
  return `${points}`;
};
