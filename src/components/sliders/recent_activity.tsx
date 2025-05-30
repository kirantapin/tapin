import React from "react";
import { Item, PassItem, Restaurant, Transaction } from "@/types";
import { DrinkItem } from "../menu_items";
import { ItemUtils } from "@/utils/item_utils";
import { PASS_MENU_TAG } from "@/constants";
import { TransactionUtils } from "@/utils/transaction_utils";

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

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  restaurant,
  addToCart,
  removeFromCart,
  state,
}) => {
  // Get unique transactions by item ID, keeping only the first occurrence

  const processedTransactionItems = TransactionUtils.getRecentTransactionItems(
    transactions,
    restaurant,
    []
  );

  if (processedTransactionItems.length <= 0 || !restaurant) {
    return null;
  }
  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        Recent Activity
      </h1>

      <div className="overflow-x-auto no-scrollbar -mx-4 pr-4">
        <div className="flex">
          {[...processedTransactionItems].slice(0, 3).map((item, index) => {
            return (
              <div className="w-[95%] flex-none" key={index}>
                <DrinkItem
                  key={item?.id}
                  item={
                    {
                      id: item.id,
                      modifiers: item.modifiers,
                    } as Item
                  }
                  purchaseDate={item.purchaseDate}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
