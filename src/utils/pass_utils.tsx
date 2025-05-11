import { ItemUtils } from "./item_utils";
import { supabase } from "./supabase_client";
import { Cart, CartItem, Pass, PassItem, Restaurant } from "@/types";
export class PassUtils {
  static fetchPasses = async (restaurantId: string | null): Promise<Pass[]> => {
    const { data, error } = await supabase
      .from("passes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("end_time", new Date().toISOString());
    if (error) {
      console.error("Error fetch temporary items.", error.message);
      return [];
    }

    return data;
  };

  static fetchPassAmountRemaining = async (
    passId: string
  ): Promise<number | null> => {
    const { data, error } = await supabase
      .from("passes")
      .select("amount_remaining")
      .eq("pass_id", passId)
      .single();
    if (error) {
      console.error("Error fetch pass amount remaining.", error.message);
      return null;
    }
    return data.amount_remaining;
  };
  static isPassInCartAvailable = (
    passId: string,
    restaurant: Restaurant,
    cart: Cart,
    offset: number = 0
  ): { available: boolean; amount_to_remove: number } => {
    // Get total quantity of this pass in cart
    const passQuantityInCart = cart.reduce(
      (total: number, cartItem: CartItem) => {
        if (cartItem.item.id === passId) {
          return total + cartItem.quantity;
        }
        return total;
      },
      0
    );
    const passItem = ItemUtils.getMenuItemFromItemId(
      passId,
      restaurant
    ) as PassItem;

    if (!passItem || !passItem.price) {
      return { available: false, amount_to_remove: 0 };
    }

    const { amount_remaining, end_time } = passItem;

    // Check if pass has expired
    const now = new Date();
    const passEndTime = new Date(end_time);
    if (passEndTime < now) {
      return { available: false, amount_to_remove: passQuantityInCart };
    }

    if (amount_remaining === null) {
      return { available: true, amount_to_remove: 0 };
    }

    // Check if enough passes remaining
    return {
      available: amount_remaining >= passQuantityInCart + offset,
      amount_to_remove: passQuantityInCart - amount_remaining,
    };
  };
}
