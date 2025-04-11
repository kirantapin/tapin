import { useState, useEffect, useMemo } from "react";
import { SearchEngine } from "@/utils/search_engine";
import { ItemSpecification, Restaurant } from "@/types";

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

  for (const key of Object.keys(menu)) {
    if (menu[key]?.price !== undefined) {
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
  const searchEngine = useMemo(
    () => new SearchEngine(itemIds, restaurant),
    [itemIds]
  );

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
