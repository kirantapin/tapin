import { Item, PassItem, Transaction } from "@/types";
import { Restaurant } from "@/types";
import { supabase } from "./supabase_client";
import { ItemUtils } from "./item_utils";
import { BUNDLE_MENU_TAG, PASS_MENU_TAG } from "@/constants";

export class TransactionUtils {
  static getRecentTransactionItems = (
    transactions: Transaction[],
    restaurant: Restaurant | null,
    filters: ((object: {
      id: string;
      modifiers: string[];
      purchaseDate: string;
    }) => boolean)[]
  ): {
    id: string;
    modifiers: string[];
    purchaseDate: string;
  }[] => {
    if (!restaurant) {
      return [];
    }
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
        const purchaseDate = transactionItem.created_at;
        if (metadata?.path?.includes(PASS_MENU_TAG)) {
          // Get second to last item from path array
          const item = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
          if (item) {
            return {
              id: itemId,
              modifiers: [],
              purchaseDate: purchaseDate,
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
              purchaseDate: purchaseDate,
            };
          } else {
            return null;
          }
        } else {
          if (!ItemUtils.getMenuItemFromItemId(itemId, restaurant)) {
            return null;
          }
          return {
            id: itemId,
            modifiers: modifiers,
            purchaseDate: purchaseDate,
          };
        }
      })
      .filter((item) => item !== null);
    const filteredTransactionItems = processedTransactionItems.filter((item) =>
      filters.every((filter) => filter(item))
    );
    return filteredTransactionItems;
  };
  static fetchTransactionData = async (
    userId: string | null
  ): Promise<Transaction[]> => {
    if (!userId) {
      return [];
    }
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const formattedDate = ninetyDaysAgo.toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", formattedDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return [];
    }
  };

  static isTransactionRedeemable = (
    transaction: Transaction,
    restaurant: Restaurant
  ): boolean => {
    const item = {
      id: transaction.item,
      modifiers: transaction.metadata.modifiers || [],
    };
    return ItemUtils.isItemRedeemable(item, restaurant);
  };

  static getTransactionHistory = (
    transactions: Transaction[],
    restaurant: Restaurant
  ): {
    item: Item;
    fulfilled_at: string;
  }[] => {
    const redeemedTransactions = transactions.filter(
      (transaction) =>
        transaction.restaurant_id === restaurant.id &&
        transaction.fulfilled_by != null &&
        transaction.fulfilled_at != null &&
        !transaction.metadata.path?.includes(BUNDLE_MENU_TAG)
    );
    const transactionHistory = redeemedTransactions.map((transaction) => {
      const item = this.getTransactionItem(transaction);
      return {
        item: item,
        fulfilled_at: transaction.fulfilled_at as string,
      };
    });
    return transactionHistory;
  };

  static getTransactionItem(transaction: Transaction): {
    id: string;
    modifiers: string[];
    path: string[];
  } {
    const item = {
      id: transaction.item,
      modifiers: transaction.metadata.modifiers || [],
      path: (transaction.metadata.path || []) as string[],
    };
    if (item.path.includes(PASS_MENU_TAG)) {
      item.id = item.path[1];
    }
    return item;
  }
}
