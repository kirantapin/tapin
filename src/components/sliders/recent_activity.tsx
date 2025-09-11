import React from "react";
import { Restaurant, Transaction } from "@/types";
import { DrinkItem } from "../menu_items";
import { ItemUtils } from "@/utils/item_utils";
import { TransactionUtils } from "@/utils/transaction_utils";

interface RecentActivityProps {
  transactions: Transaction[];
  restaurant: Restaurant;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  restaurant,
}) => {
  const processedTransactionItems = TransactionUtils.getRecentTransactionItems(
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

      <div className="overflow-x-auto no-scrollbar -mx-4 pr-4">
        <div className="flex">
          {[...processedTransactionItems].slice(0, 3).map((item, index) => {
            if (!ItemUtils.getMenuItemFromItemId(item.item.id, restaurant)) {
              return null;
            }
            return (
              <div className="w-[95%] flex-none" key={index}>
                <DrinkItem
                  key={item.item.id}
                  item={item.item}
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
