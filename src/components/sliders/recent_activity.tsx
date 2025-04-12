import React from "react";
import { Restaurant } from "@/types";
import { DrinkItem } from "../menu_items";

interface RecentActivityProps {
  transactions: Array<{
    item: string;
  }>;
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
  const recentTransactionItems = new Set(
    transactions.slice(0, 10).map((t) => t.item)
  );
  if (recentTransactionItems.size <= 0 || !restaurant) {
    return null;
  }
  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        Recent Activity
      </h1>

      <div className="overflow-x-auto flex shrink-0 no-scrollbar space-x-2">
        {[...recentTransactionItems].slice(0, 3).map((itemId) => {
          return (
            <DrinkItem
              itemId={itemId}
              restaurant={restaurant}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cart={state.cart}
              dealEffect={state.dealEffect}
            />
          );
        })}
      </div>
    </div>
  );
};
