import { Item, RecentOrder, Transaction } from "@/types";
import { Restaurant } from "@/types";
import { supabase } from "./supabase_client";
import { ItemUtils } from "./item_utils";
import { BUNDLE_MENU_TAG, MAX_TRANSACTION_LOOKBACK } from "@/constants";

export class TransactionUtils {
  static getRecentTransactionItems = (
    transactions: Transaction[],
    restaurant: Restaurant | null
  ): {
    item: Item;
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
    const processedTransactionItems = [...recentTransactionItems].map(
      (transactionItem) => {
        const item = TransactionUtils.getTransactionItem(transactionItem);
        const purchaseDate = transactionItem.created_at;
        return {
          item: item,
          purchaseDate: purchaseDate,
        };
      }
    );

    return processedTransactionItems;
  };
  static fetchTransactionData = async (
    userId: string | null
  ): Promise<Transaction[]> => {
    if (!userId) {
      return [];
    }
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - MAX_TRANSACTION_LOOKBACK);
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
    const item = this.getTransactionItem(transaction);
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
    variation: string | null;
    modifiers: Record<string, string[]>;
    path: string[];
  } {
    const item = {
      id: transaction.item,
      variation: transaction.metadata.variation || null,
      modifiers: transaction.metadata.modifiers || {},
      path: (transaction.metadata.path || []) as string[],
    };

    return item;
  }

  static fetchRecentOrders = async (
    restaurant: Restaurant,
    user_id: string,
    start_time: Date,
    end_time: Date
  ): Promise<RecentOrder[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, transactions(*)")
      .eq("user_id", user_id)
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", start_time.toISOString())
      .lte("created_at", end_time.toISOString());

    if (error) {
      console.error("Error fetching orders and transactions:", error);
      return [];
    }

    return (data || []).map(({ transactions, ...order }) => ({
      order, // all fields from row except transactions
      transactions: transactions || [],
      policies: [],
    }));
  };
}
