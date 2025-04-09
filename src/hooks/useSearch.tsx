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

function getAllItemPaths(
  menu: any,
  currentPath: string[] = []
): ItemSpecification[] {
  const paths: ItemSpecification[] = [];

  // Base case: if this node has a price, it's a leaf (menu item)
  if (menu?.price !== undefined) {
    paths.push([...currentPath]);
    return paths;
  }

  // If it's an object, recursively search its properties
  if (menu && typeof menu === "object" && !Array.isArray(menu)) {
    for (const key of Object.keys(menu)) {
      paths.push(...getAllItemPaths(menu[key], [...currentPath, key]));
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
  const itemPaths = useMemo(() => {
    if (!restaurant?.menu) return [];
    return getAllItemPaths(restaurant.menu);
  }, [restaurant?.menu]);

  // Create a memoized instance of SearchEngine with all item paths
  const searchEngine = useMemo(() => new SearchEngine(itemPaths), [itemPaths]);

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
