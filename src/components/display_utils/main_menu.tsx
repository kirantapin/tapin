import React, { useEffect, useRef, useState } from "react";
import { DrinkItem, DrinkList } from "../menu_items";
import { titleCase } from "title-case";
import { Search, X } from "lucide-react";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { Restaurant } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { ItemUtils } from "@/utils/item_utils";

interface MainMenuProps {
  orderDrinksRef: React.RefObject<HTMLDivElement>;
  scrollToOrderDrinks: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  orderDrinksRef,
  scrollToOrderDrinks,
}) => {
  const { restaurant } = useRestaurant();
  const { addToCart } = useBottomSheet();
  const { searchResults, searchQuery, setSearchQuery, clearSearch } = useSearch(
    {
      restaurant: restaurant as Restaurant,
      initialQuery: "",
    }
  );
  const [labelsToDisplay, setLabelsToDisplay] = useState<string[] | undefined>(
    undefined
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const slideToFilter = (filter: string) => {
    const button = buttonRefs.current.get(filter);
    const container = scrollContainerRef.current;
    if (button && container) {
      const scrollLeft = button.offsetLeft - 10;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!restaurant || labelsToDisplay !== undefined) return;
    const labelsSet = new Set<string>();

    for (const [itemId, value] of Object.entries(restaurant.menu)) {
      if (
        ItemUtils.isItemAvailable({ id: itemId, modifiers: [] }, restaurant)
      ) {
        continue;
      }

      for (const [label, labelId] of Object.entries(restaurant.labelMap)) {
        if (value.path.includes(labelId)) {
          labelsSet.add(label);
        }
      }
    }

    setLabelsToDisplay(Array.from(labelsSet));
  }, [restaurant]);

  if (!restaurant || labelsToDisplay === undefined) return null;
  return (
    <div>
      <div
        ref={orderDrinksRef}
        className="sticky top-0 z-10 bg-white border-b shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)] pt-1 -mx-4 px-4"
      >
        <div className="flex justify-between items-center mb-3 mt-3">
          <h1 className="text-xl font-bold">Order</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 border rounded-full text-base outline-none"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onClick={() => {
              setTimeout(() => {
                scrollToOrderDrinks();
              }, 200);
            }}
            value={searchQuery}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-black" />
            </button>
          )}
        </div>
        <div
          className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"
          ref={scrollContainerRef}
        >
          {labelsToDisplay.map((filter) => (
            <button
              key={filter}
              ref={(el) => {
                if (el) {
                  buttonRefs.current.set(filter, el);
                }
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2 rounded-full whitespace-nowrap border transition-all duration-150 font-medium ${
                activeFilter === filter ? "text-sm" : "text-sm text-gray-500"
              }`}
              style={
                activeFilter === filter
                  ? {
                      color: restaurant?.metadata.primaryColor,
                      borderColor: restaurant?.metadata.primaryColor,
                    }
                  : {
                      backgroundColor: "#f6f8fa",
                      borderColor: "#e5e7eb", // neutral border for inactive
                    }
              }
              onClick={() => {
                setSearchQuery("");
                setActiveFilter(filter);
                slideToFilter(filter);
              }}
            >
              {titleCase(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {searchResults.length > 0 ? (
        <div
          style={{
            height: `calc(100vh - ${
              (orderDrinksRef.current?.offsetHeight || 0) + 10
            }px)`,
          }}
        >
          <pre className="whitespace-pre-wrap break-words">
            {searchResults.map((searchResult, index) => (
              <DrinkItem
                key={searchResult}
                item={{ id: searchResult, modifiers: [] }}
              />
            ))}
          </pre>
        </div>
      ) : (
        <DrinkList
          label={activeFilter}
          slideToFilter={slideToFilter}
          restaurant={restaurant}
          addToCart={addToCart}
          itemSpecifications={[]}
          padBottom={false}
        />
      )}
    </div>
  );
};

export default MainMenu;
