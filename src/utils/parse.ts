import { PASS_MENU_TAG } from "@/constants";
import { Item, ItemSpecification, Policy, Restaurant } from "@/types";
import { titleCase } from "title-case";
import { ItemUtils } from "./item_utils";

export const listItemsToStringDescription = (
  quantity: number,
  items: string[],
  injectWord: string | null = null,
  restaurant: Restaurant
) => {
  if (items.length > 1) {
    const itemNames = items
      .map((item) =>
        ItemUtils.getItemName({ id: item, modifiers: [] }, restaurant)
      )
      .join(" or ");
    return `${quantity} ${
      injectWord ? injectWord + " " : ""
    }orders of either ${itemNames}`;
  } else if (items.length === 1) {
    const itemName = ItemUtils.getItemName(
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

export function sentenceCase(text: string | null) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
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
