import { supabase } from "./supabase_client.ts";
import { Menu, Cart, CartItem, Restaurant } from "../types";

export const assignIds = (items: CartItem[]): void => {
  items.forEach((item, index) => {
    item.id = index; // Directly modify the `id` of each item
  });
};

export const submit_drink_order = async (
  drink_order: string,
  restaurant: Restaurant
): Promise<Cart | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "submit_drink_query",
      {
        body: JSON.stringify({
          drink_order: drink_order,
          menu: restaurant.menu,
        }),
      }
    );
    if (error) throw error;
    const { response } = data;
    const temp_items: CartItem[] = [];
    for (const [index, item] of response.entries()) {
      const quantity = item.quantity;
      delete item.quantity;

      const temp_cart_item = {
        id: index,
        item: item,
        quantity: quantity,
        price: 0,
        points: 0,
        point_cost: 0,
      };
      temp_items.push(temp_cart_item);
    }

    assignIds(temp_items);

    return temp_items;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
