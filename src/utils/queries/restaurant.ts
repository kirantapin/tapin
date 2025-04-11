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

  // const tempMenu = data.menu;
  // const liquorMenu = tempMenu[DRINK_MENU_TAG]["liquor"];
  // tempMenu[DRINK_MENU_TAG]["house_mixer"] = liquorMenu;
  // tempMenu[DRINK_MENU_TAG]["shots_or_shooters"] = liquorMenu;
  // delete tempMenu[DRINK_MENU_TAG]["liquor"];
  // data.menu = tempMenu;
  // data.menu[PASS_MENU_TAG] = passes;

  for (const pass of passes) {
    const passMenu = data.alt_menu[PASS_MENU_TAG];
    passMenu[pass.itemId][pass.pass_id] = {
      name: passMenu[pass.itemId].name,
      price: pass.price,
      description: pass.item_description,
      imageUrl: pass.image_url,
      for_date: pass.for_date,
      isPass: true,
    };
  }

  console.log("data.alt_menu", data.alt_menu);

  data.menu = indexMenu(data.alt_menu);

  console.log("new menu", data.menu);

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

  // const passMenu = {};

  // for (const pass of data) {
  //   if (pass.item_name in passMenu) {
  //     passMenu[pass.item_name][pass.for_date] = {
  //       price: pass.price,
  //       description: pass.item_description,
  //     };
  //   } else {
  //     passMenu[pass.item_name] = {
  //       [pass.for_date]: {
  //         price: pass.price,
  //         description: pass.item_description,
  //       },
  //     };
  //   }
  // }

  return data;
};

export function indexMenu(menu: Record<string, any>): FlatIndex {
  const index = {};

  /** Depth‑first walk */
  function dfs(nodeObj, nodeId: string, pathSoFar: string[]): void {
    const path = [...pathSoFar, nodeId];
    const children: string[] = [];
    const info: Record<string, any> = {};

    if (nodeObj.price) {
      for (const [key, value] of Object.entries(nodeObj)) {
        // Numeric keys are children, everything else is metadata
        info[key] = value;
      }
      index[nodeId] = { path, children, info };
      return;
    }

    for (const [key, value] of Object.entries(nodeObj)) {
      // Numeric keys are children, everything else is metadata
      if (key !== "name") {
        children.push(key);
      } else {
        info[key] = value;
      }
    }

    index[nodeId] = { path, children, info };

    // Recurse into every child, even leaves — they’ll exit immediately

    for (const childId of children) {
      dfs(nodeObj[childId], childId, path);
    }
  }

  // Handle each top‑level branch (1, 2, 3, …)
  for (const [rootId, rootNode] of Object.entries(menu)) {
    dfs(rootNode, rootId, []);
  }

  return index;
}
