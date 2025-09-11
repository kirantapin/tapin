import React, { useState } from "react";
import { Restaurant, Transaction } from "@/types";
import { TransactionUtils } from "@/utils/transaction_utils";

import { RedeemedTransaction } from "../menu_items";

interface RedeemHistoryProps {
  restaurant: Restaurant;
  transactions: Transaction[];
}

export const RedeemHistory: React.FC<RedeemHistoryProps> = ({
  restaurant,
  transactions,
}) => {
  const [showAll, setShowAll] = useState(false);

  const transactionHistory = TransactionUtils.getTransactionHistory(
    transactions,
    restaurant
  );

  // Sort by fulfilled_at date (most recent first)
  const sortedHistory = transactionHistory.sort(
    (a, b) =>
      new Date(b.fulfilled_at).getTime() - new Date(a.fulfilled_at).getTime()
  );

  // Show only first 10 items unless showAll is true
  const displayedHistory = showAll ? sortedHistory : sortedHistory.slice(0, 10);

  if (sortedHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No redemption history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 mb-8">
      <div className="space-y-4">
        {displayedHistory.map((item, index) => (
          <RedeemedTransaction
            key={`${item.item.id}-${item.fulfilled_at}-${index}`}
            item={item.item}
            purchaseDate={item.fulfilled_at}
          />
        ))}
      </div>

      {sortedHistory.length > 10 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-md font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showAll ? "Show Less" : `Show ${sortedHistory.length - 10} More`}
          </button>
        </div>
      )}
    </div>
  );
};
