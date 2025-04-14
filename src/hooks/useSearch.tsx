import { useState, useEffect, useMemo } from "react";
import { SearchEngine } from "@/utils/search_engine";
import { ItemSpecification, Restaurant } from "@/types";
import { rest } from "lodash";

interface UseSearchProps {
  restaurant: Restaurant;
  initialQuery?: string;
}

interface UseSearchReturn {
  searchResults: ItemSpecification[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

function getAllItemIds(menu: any): ItemSpecification[] {
  const paths: ItemSpecification[] = [];

  // Loop through menu object keys
  for (const key in menu) {
    // If item has a price, it's a leaf node (actual menu item)
    if (menu[key].info.price) {
      paths.push(key);
    }
  }

  return paths;
}

export function useSearch({
  restaurant,
  initialQuery = "",
}: UseSearchProps): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // Get all item paths using DFS
  const itemIds = useMemo(() => {
    if (!restaurant?.menu) return [];
    return getAllItemIds(restaurant.menu);
  }, [restaurant?.menu]);

  // Create a memoized instance of SearchEngine with all item paths
  const searchEngine = useMemo(() => {
    return new SearchEngine(itemIds, restaurant);
  }, [itemIds, restaurant]);

  // Memoize search results
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchEngine.search(searchQuery);
  }, [searchQuery, searchEngine]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return {
    searchResults,
    searchQuery,
    setSearchQuery,
    clearSearch,
  };
}
