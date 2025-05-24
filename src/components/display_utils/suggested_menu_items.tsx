import React from "react";
import { Item, Restaurant } from "@/types";
import { DrinkItem } from "../menu_items";
import { ItemUtils } from "@/utils/item_utils";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useAuth } from "@/context/auth_context";
import { useRestaurant } from "@/context/restaurant_context";
import { TransactionUtils } from "@/utils/transaction_utils";
import { HOUSE_MIXER_LABEL } from "@/constants";

interface SuggestedMenuItemsProps {
  type: string;
  filters: ((object: any) => boolean)[];
}

const getItemByName = (
  name: string,
  modifiers: string[] = [],
  restaurant: Restaurant
): Item | null => {
  const lowerName = name.toLowerCase();
  const menuKey = Object.keys(restaurant.menu).find((key) =>
    restaurant.menu[key].info?.name?.toLowerCase().includes(lowerName)
  );
  if (!menuKey) return null;
  const allChildren = ItemUtils.getAllItemsInCategory(menuKey, restaurant);
  if (allChildren.length === 0) return null;
  return {
    id: allChildren[0],
    modifiers: modifiers,
  };
};

export const SuggestedMenuItems: React.FC<SuggestedMenuItemsProps> = ({
  type,
  filters,
}) => {
  // Get unique transactions by item ID, keeping only the first occurrence

  const { transactions } = useAuth();
  const { restaurant } = useRestaurant();

  const { addToCart, removeFromCart, state } = useBottomSheet();

  const exampleItems: { liquorName: string; modifiers: string[] }[] = [
    {
      liquorName: "rum",
      modifiers: type === HOUSE_MIXER_LABEL ? ["with Coke"] : [],
    },
    {
      liquorName: "vodka",
      modifiers: type === HOUSE_MIXER_LABEL ? ["with Sprite"] : [],
    },
    {
      liquorName: "tequila",
      modifiers: type === HOUSE_MIXER_LABEL ? ["with Soda"] : [],
    },
    {
      liquorName: "whiskey",
      modifiers: type === HOUSE_MIXER_LABEL ? ["with Coke"] : [],
    },
    {
      liquorName: "gin",
      modifiers: type === HOUSE_MIXER_LABEL ? ["with Tonic"] : [],
    },
  ];

  const processedTransactionItems: Item[] =
    TransactionUtils.getRecentTransactionItems(
      transactions,
      restaurant,
      filters
    );

  const processedSuggestedItems: Item[] = exampleItems
    .map((item) => {
      return getItemByName(
        item.liquorName,
        item.modifiers,
        restaurant as Restaurant
      );
    })
    .filter((item) => item !== null);

  const finalItems = [
    ...processedTransactionItems,
    ...processedSuggestedItems.slice(
      0,
      Math.max(0, 5 - processedTransactionItems.length)
    ),
  ].slice(0, 5);

  if (!restaurant) {
    return null;
  }
  return (
    <div className="mt-0">
      {finalItems.map((item) => {
        return (
          <DrinkItem
            key={item?.id}
            restaurant={restaurant}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            cart={state.cart}
            item={item as Item}
            purchaseDate={item?.purchaseDate || null}
          />
        );
      })}
    </div>
  );
};
