import React from "react";
import { Item, PassItem, Restaurant, Transaction } from "@/types";
import { DrinkItem } from "../menu_items";
import { rest } from "lodash";
import { ItemUtils } from "@/utils/item_utils";
import { PASS_MENU_TAG } from "@/constants";

interface RecentActivityProps {
  transactions: Transaction[];
  restaurant: Restaurant;
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (item: any) => Promise<void>;
  state: {
    cart: any;
    dealEffect: any;
  };
}

const processTransactionItems = (
  transactions: Transaction[],
  restaurant: Restaurant
) => {
  const recentTransactionItems: Transaction[] = transactions
    .filter((transaction) => transaction.restaurant_id === restaurant.id)
    .sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10)
    .reduce((unique: Array<Transaction>, transaction: Transaction) => {
      // Only add if we haven't seen this item ID before
      if (!unique.find((t) => t.item === transaction.item)) {
        unique.push(transaction);
      }
      return unique;
    }, []);
  const processedTransactionItems = [...recentTransactionItems]
    .map((transactionItem) => {
      const itemId = transactionItem.item;
      const metadata = transactionItem.metadata;
      const modifiers = metadata?.modifiers || [];
      if (metadata?.path?.includes(PASS_MENU_TAG)) {
        // Get second to last item from path array
        const item = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
        if (item) {
          return {
            id: itemId,
            modifiers: [],
          };
        }
        const sameCurrentPassItems = ItemUtils.getAllItemsInCategory(
          metadata?.path[metadata?.path.length - 2],
          restaurant
        );
        if (sameCurrentPassItems.length > 0) {
          return {
            id: sameCurrentPassItems.reduce((earliest, currentId) => {
              const currentItem = ItemUtils.getMenuItemFromItemId(
                currentId,
                restaurant
              ) as PassItem;
              const earliestItem = ItemUtils.getMenuItemFromItemId(
                earliest,
                restaurant
              ) as PassItem;
              return new Date(currentItem.for_date) <
                new Date(earliestItem.for_date)
                ? currentId
                : earliest;
            }, sameCurrentPassItems[0]),
            modifiers: [],
          };
        } else {
          return null;
        }
      }
      return {
        id: itemId,
        modifiers: modifiers,
      };
    })
    .filter((item) => item?.id !== null);
  return processedTransactionItems;
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  restaurant,
  addToCart,
  removeFromCart,
  state,
}) => {
  // Get unique transactions by item ID, keeping only the first occurrence

  const processedTransactionItems = processTransactionItems(
    transactions,
    restaurant
  );

  if (processedTransactionItems.length <= 0 || !restaurant) {
    return null;
  }
  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        Recent Activity
      </h1>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="grid grid-flow-col auto-cols-[minmax(22rem,max-content)] gap-2">
          {[...processedTransactionItems].slice(0, 3).map((item) => {
            return (
              <DrinkItem
                key={item?.id}
                restaurant={restaurant}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                cart={state.cart}
                item={item as Item}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
