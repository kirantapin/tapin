import { supabase } from "../supabase_client";
import { Restaurant } from "../../types";

export const fetchRestaurantById = async (
  restaurantId: string | undefined
): Promise<Restaurant | null> => {
  if (!restaurantId) {
    return null;
  }
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();
  console.log(data);
  if (error) {
    console.error("Error fetching restaurant:", error.message);
    return null;
  }

  return data;
};
