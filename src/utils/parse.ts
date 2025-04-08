import { PASS_MENU_TAG } from "@/constants";
import { Item, ItemSpecification, Policy } from "@/types";
import { titleCase } from "title-case";

export const itemToStringDescription = (item: Item) => {
  const path = item.path;
  if (path[0] === PASS_MENU_TAG) {
    return titleCase(path[1]);
  }
  if (path[path.length - 3] === "house_mixer") {
    //TODO
    if (path[path.length - 1] === "house") {
      return titleCase(`${path[path.length - 2]} House Mixer`);
    } else {
      return titleCase(`House Mixer with ${path[path.length - 1]}`);
    }
  }
  if (path[path.length - 3] === "shots_or_shooters") {
    if (path[path.length - 1] === "house") {
      return titleCase(`${path[path.length - 2]} Shot`);
    } else {
      return titleCase(`Shot of ${path[path.length - 1]}`);
    }
  }
  return titleCase(path[path.length - 1]);
};

const listItemsToStringDescription = (
  quantity: number,
  items: string[][],
  injectWord: string | null = null
) => {
  if (items.length > 1) {
    const itemNames = items
      .map((item) => itemToStringDescription({ path: item, modifiers: [] }))
      .join(" or ");
    return `${quantity} ${
      injectWord ? injectWord + " " : ""
    }orders of either ${itemNames}`;
  } else if (items.length === 1) {
    const itemName = itemToStringDescription({ path: items[0], modifiers: [] });
    return `${quantity} ${injectWord ? injectWord + " " : ""}${itemName}${
      quantity > 1 ? "s" : ""
    }`;
  } else {
    return "";
  }
};

export const policyToStringDescription = (policy: Policy) => {
  const conditions = policy.definition.conditions;
  const action = policy.definition.action;
  const conditionDescriptions = conditions.map((condition) => {
    switch (condition.type) {
      case "minimum_cart_total":
        return `Minimum cart total of $${condition.amount}`;
      case "minimum_quantity":
        return `At least ${listItemsToStringDescription(
          condition.quantity,
          condition.items
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
          "free"
        )}`;
      //Get 30 % off on up to 3 orders of either item or item or item
      case "apply_percent_discount":
        return `Get ${
          action.amount
        }% off on up to ${listItemsToStringDescription(
          action.maxEffectedItems,
          action.items
        )}`;
      case "apply_fixed_discount":
        return `Get $${
          action.amount
        } off on up to ${listItemsToStringDescription(
          action.maxEffectedItems,
          action.items
        )}`;
      case "apply_point_multiplier":
        return `Earn ${
          action.amount
        }x points on up to ${listItemsToStringDescription(
          action.maxEffectedItems,
          action.items
        )}`;
      case "apply_point_cost":
        return `Up to ${listItemsToStringDescription(
          action.maxEffectedItems,
          action.items
        )} can be redeemed for ${action.amount} points each`;
      case "apply_order_point_multiplier":
        return `Earn ${action.amount}x points on your entire order`;
      case "apply_fixed_order_discount":
        return `Get a fixed discount of $${action.amount} on your order`;
      case "apply_blanket_price":
        return `$${action.amount} total for select items`;
      case "apply_order_percent_discount":
        return `Get a ${action.amount}% discount on your entire order`;
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
    minute: undefined,
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
      return `${action.amount}% Off`;
    case "apply_fixed_discount":
      return `$${action.amount} Off`;
    case "apply_point_multiplier":
      return `${action.amount}x Points`;
    case "apply_point_cost":
      return `Redeem for ${action.amount} Points`;
    case "apply_order_point_multiplier":
      return `${action.amount}x Points on Whole Order`;
    case "apply_fixed_order_discount":
      return `$${action.amount} Off Whole Order`;
    case "apply_blanket_price":
      return `$${action.amount} Total`;
    case "apply_order_percent_discount":
      return `${action.amount}% Off Whole Order`;
    default:
      return "";
  }
}

export function getItemName(item: ItemSpecification): string {
  if (isPassItem(item)) {
    return titleCase(item[1]);
  }
  return titleCase(item[item.length - 1]);
}

export function isPassItem(item: ItemSpecification): boolean {
  return item[0] === PASS_MENU_TAG;
}

export function keywordExtraction(item: ItemSpecification): string[] {
  const keywords: string[] = [];

  // Add each path segment as a keyword
  item.forEach((segment) => {
    // Split segment into individual words and clean them
    const words = segment
      .toLowerCase()
      .split(/[\s-]+/) // Split on spaces and hyphens
      .filter((word) => word.length > 2) // Filter out very short words
      .map((word) => word.trim());

    keywords.push(...words);
  });

  // If it's a pass item, add "pass" as a keyword
  if (isPassItem(item)) {
    keywords.push("pass");
  }

  // Remove duplicates
  const uniqueKeywords = [...new Set(keywords)];

  // Filter out common words that aren't useful for search
  const stopWords = ["the", "and", "with", "for", "from"];
  return uniqueKeywords.filter((word) => !stopWords.includes(word));
}
