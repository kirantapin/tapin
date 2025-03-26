import { PASS_MENU_TAG } from "@/constants";
import { Item } from "@/types";
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
        )} `;
      case "exact_quantity":
        return `Exactly ${listItemsToStringDescription(
          condition.quantity,
          condition.items
        )} in cart`;
      case "total_quantity":
        return `Your cart has exactly ${
          condition.quantity > 1 ? `${condition.quantity} items` : "1 item"
        }`;
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
        return `Your entire order is $${action.amount}`;
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
