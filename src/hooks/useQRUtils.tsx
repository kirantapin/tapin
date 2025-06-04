import { useState } from "react";
import { Item, Restaurant, Transaction } from "@/types";
import { MAX_QR_TRANSACTIONS } from "@/constants";

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

  const validateTransactions = (
    transactions: Transaction[],
    triggerToast: (
      message: string,
      type: "error" | "success" | "info",
      duration?: number
    ) => void,
    onClose: () => void,
    restaurant: Restaurant
  ): boolean => {
    if (transactions.length <= 0 || !restaurant) {
      return false;
    }
    if (transactions.length > MAX_QR_TRANSACTIONS) {
      triggerToast(
        "Please try to redeem again with a fewer number of items.",
        "error"
      );
      onClose();
      return false;
    }

    // Check if all transactions are from the same restaurant and unfulfilled
    const allSameRestaurant = transactions.every(
      (transaction) =>
        transaction.restaurant_id === transactions[0].restaurant_id
    );
    const allUnfulfilled = transactions.every(
      (transaction) => transaction.fulfilled_by === null
    );

    if (!allSameRestaurant || !allUnfulfilled) {
      onClose();
      triggerToast("Something went wrong. Please try again.", "error");
      return false;
    }
    return true;
  };

  const getItemsFromTransactions = (transactions: Transaction[]): Item[] => {
    const itemsToBeRedeemed: Item[] = [];
    transactions.forEach((transaction) => {
      const modifiers = (transaction.metadata.modifiers as string[]) || [];
      itemsToBeRedeemed.push({
        id: transaction.item,
        modifiers: modifiers,
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
    validateTransactions,
    getItemsFromTransactions,
  };
};
