import { useState } from "react";
import { Item, Transaction } from "@/types";
import { TransactionUtils } from "@/utils/transaction_utils";

export const useQRUtils = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTransactions = (transactions: Transaction[]): string => {
    const displayList = transactions.map(
      (transaction) => transaction.transaction_id
    );
    return JSON.stringify(displayList);
  };

  function determineErrorCorrectionLevel(value: string): "L" | "M" | "Q" | "H" {
    const length = value.length;

    if (length <= 50) return "L"; // light data
    if (length <= 100) return "M"; // moderate
    if (length <= 200) return "Q"; // dense
    return "H"; // very dense, highest correction
  }

  const getItemsFromTransactions = (
    transactions: Transaction[]
  ): { item: Item; purchaseDate: string }[] => {
    const itemsToBeRedeemed: { item: Item; purchaseDate: string }[] = [];
    transactions.forEach((transaction) => {
      itemsToBeRedeemed.push({
        item: TransactionUtils.getTransactionItem(transaction),
        purchaseDate: transaction.created_at,
      });
    });
    return itemsToBeRedeemed;
  };

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    formatTransactions,
    determineErrorCorrectionLevel,
    getItemsFromTransactions,
  };
};
