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

  if (error) {
    console.error("Error fetching restaurant:", error.message);
    return null;
  }

  const tempMenu = data.menu;
  const liquorMenu = tempMenu["drink"]["liquor"];
  tempMenu["drink"]["house_mixer"] = liquorMenu;
  tempMenu["drink"]["shots_or_shooters"] = liquorMenu;
  delete tempMenu["drink"]["liquor"];
  data.menu = tempMenu;

  return data;
};
