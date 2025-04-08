import Fuse from "fuse.js";
import { ItemSpecification } from "../types";
import { keywordExtraction, getItemName } from "./parse";

interface SearchableItem {
  id: string;
  name: string;
  keywords: string[];
  originalItem: ItemSpecification;
}

export class SearchEngine {
  private fuse: Fuse<SearchableItem>;
  private items: SearchableItem[];

  constructor(items: ItemSpecification[]) {
    this.items = items.map((item) => ({
      id: item.join("_"),
      name: getItemName(item),
      keywords: keywordExtraction(item),
      originalItem: item,
    }));

    // Configure Fuse options for fuzzy search
    const options = {
      keys: ["name", "keywords"],
      includeScore: true,
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
    };

    this.fuse = new Fuse(this.items, options);
  }

  search(query: string): ItemSpecification[] {
    if (!query) {
      return this.items.map((item) => item.originalItem);
    }

    const results = this.fuse.search(query.toLowerCase());

    // Return original items sorted by search relevance
    return results.map((result) => result.item.originalItem);
  }

  addItem(item: ItemSpecification) {
    const searchableItem = {
      id: item.join("_"),
      name: getItemName(item),
      keywords: keywordExtraction(item),
      originalItem: item,
    };
    this.items.push(searchableItem);
    this.fuse.add(searchableItem);
  }

  removeItem(item: ItemSpecification) {
    const id = item.join("_");
    const index = this.items.findIndex((i) => i.id === id);
    if (index > -1) {
      this.items.splice(index, 1);
      this.fuse.remove((doc: SearchableItem) => doc.id === id);
    }
  }

  clear() {
    this.items = [];
    this.fuse.remove(() => true);
  }
}
