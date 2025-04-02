import { supabase } from "../supabase_client";
import { Restaurant, Pass } from "../../types";
import { PASS_MENU_TAG, DRINK_MENU_TAG } from "@/constants";

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

  const passes = await fetchPasses(restaurantId);

  const tempMenu = data.menu;
  const liquorMenu = tempMenu[DRINK_MENU_TAG]["liquor"];
  tempMenu[DRINK_MENU_TAG]["house_mixer"] = liquorMenu;
  tempMenu[DRINK_MENU_TAG]["shots_or_shooters"] = liquorMenu;
  delete tempMenu[DRINK_MENU_TAG]["liquor"];
  data.menu = tempMenu;
  data.menu[PASS_MENU_TAG] = passes;

  console.log(data);

  return data;
};

export const fetchPasses = async (
  restaurantId: string | null
): Promise<any> => {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .gte("end_time", new Date().toISOString());
  console.log(data);
  if (error) {
    console.error("Error fetch temporary items.", error.message);
    return {};
  }

  const passMenu = {};

  for (const pass of data) {
    if (pass.item_name in passMenu) {
      passMenu[pass.item_name][pass.for_date] = {
        price: pass.price,
        description: pass.item_description,
      };
    } else {
      passMenu[pass.item_name] = {
        [pass.for_date]: {
          price: pass.price,
          description: pass.item_description,
        },
      };
    }
  }

  return passMenu;
};
