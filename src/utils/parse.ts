import { ItemSpecification, Restaurant } from "@/types";
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
    return `${quantity} ${injectWord ? injectWord + " " : ""}${
      quantity > 1 ? "orders" : "order"
    } of either ${itemNames}`;
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
    if (!name) {
      continue;
    }
    keywords.push(
      ...name
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
