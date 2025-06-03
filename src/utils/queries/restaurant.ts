import { supabase } from "../supabase_client";
import { Restaurant } from "../../types";
import {
  PASS_MENU_TAG,
  HISTORY_KEY,
  BUNDLE_MENU_TAG,
  LIQUOR_MENU_TAG,
  HOUSE_MIXER_LABEL,
  SHOTS_SHOOTERS_LABEL,
  RESERVED_MENU_KEYWORDS,
} from "@/constants";
import { BundleUtils } from "../bundle_utils";
import { PassUtils } from "../pass_utils";
const HistoryCacheTTL = 30000;

export const fetchRestaurantById = async (
  restaurantId: string | undefined
): Promise<Restaurant | null> => {
  console.log("fetching restaurant", restaurantId);
  if (!restaurantId) {
    return null;
  }

  // Check local storage for recent restaurant data
  const historyStr = localStorage.getItem(HISTORY_KEY);
  let data;
  let error;

  if (historyStr) {
    try {
      const history = JSON.parse(historyStr);
      const recentRestaurant = history.find(
        (item: any) => item.restaurant.id === restaurantId
      );

      if (recentRestaurant) {
        const timestamp = new Date(recentRestaurant.timestamp).getTime();
        const now = new Date().getTime();
        const age = now - timestamp;

        // If data is less than 30 seconds old, return it
        if (age < HistoryCacheTTL) {
          data = recentRestaurant.restaurant;
          error = null;
        }
      }
    } catch (error) {
      console.error("Error parsing restaurant history:", error);
    }
  }

  if (!data) {
    const response = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .eq("active", true)
      .single();

    data = response.data;
    error = response.error;
  }

  if (error) {
    console.error("Error fetching restaurant:", error.message);
    return null;
  }

  logVisit(data);

  const [passes, bundleObjects] = await Promise.all([
    PassUtils.fetchPasses(restaurantId),
    BundleUtils.fetchBundles(restaurantId),
  ]);

  for (const pass of passes) {
    const passMenu = data.menu[PASS_MENU_TAG];
    passMenu[pass.itemId][pass.pass_id] = {
      name: passMenu[pass.itemId].name,
      price: pass.price,
      description: pass.item_description,
      amount_remaining: pass.amount_remaining,
      end_time: pass.end_time,
      for_date: pass.for_date,
      isPass: true,
    };
  }

  for (const bundleObject of bundleObjects) {
    const bundleMenu = data.menu[BUNDLE_MENU_TAG];
    bundleMenu[bundleObject.bundle.bundle_id] = {
      name: bundleObject.bundle.name,
      price: bundleObject.bundle.price,
      object: bundleObject.bundle,
      bundle_policies: bundleObject.bundlePolicies,
    };
  }

  const { menu, labelMap } = indexMenu(data.menu);
  data.menu = menu;
  data.labelMap = labelMap;

  if (Object.values(data.labelMap).includes(LIQUOR_MENU_TAG)) {
    const liquorId = Object.keys(data.labelMap).find(
      (key) => data.labelMap[key] === LIQUOR_MENU_TAG
    );
    if (liquorId) {
      delete data.labelMap[liquorId];
      data.labelMap[HOUSE_MIXER_LABEL] = LIQUOR_MENU_TAG;
      data.labelMap[SHOTS_SHOOTERS_LABEL] = LIQUOR_MENU_TAG;
    }
  }

  return data as Restaurant;
};

export function indexMenu(menu: Record<string, any>): {
  menu: Record<string, any>;
  labelMap: Record<string, string>;
} {
  const index: Record<string, any> = {};
  const labelMap: Record<string, string> = {};

  /** Depth‑first walk */
  function dfs(
    nodeObj: Record<string, any>,
    nodeId: string,
    pathSoFar: string[],
    labelSoFar: boolean
  ): void {
    const path = [...pathSoFar, nodeId];
    const children: string[] = [];
    const info: Record<string, any> = {};

    let activeLabel = false;

    if (nodeObj.price) {
      for (const [key, value] of Object.entries(nodeObj)) {
        info[key] = value;
      }
      index[nodeId] = { path, children, info };
      return;
    }

    for (const [key, value] of Object.entries(nodeObj)) {
      // Numeric keys are children, everything else is metadata

      if (!labelSoFar) {
        if (key === "label" && value === true) {
          activeLabel = true;
          labelMap[nodeObj.name] = nodeId;
        }
      }

      if (!RESERVED_MENU_KEYWORDS.includes(key)) {
        children.push(key);
      } else {
        info[key] = value;
      }
    }

    index[nodeId] = { path, children, info };

    // Recurse into every child, even leaves — they’ll exit immediately

    for (const childId of children) {
      dfs(nodeObj[childId], childId, path, activeLabel);
    }
  }

  // Handle each top‑level branch (1, 2, 3, …)
  for (const [rootId, rootNode] of Object.entries(menu)) {
    dfs(rootNode, rootId, [], false);
  }

  return { menu: index, labelMap };
}

export function logVisit(restaurant: any) {
  // Get existing history from localStorage or initialize empty array
  const historyStr = localStorage.getItem(HISTORY_KEY);
  const history = historyStr ? JSON.parse(historyStr) : [];

  // Find if restaurant already exists in history
  const existingIndex = history.findIndex(
    (item: any) => item.restaurant.id === restaurant.id
  );

  const visitedRestaurant = {
    restaurant,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    // Update existing entry
    history.splice(existingIndex, 1);
  }

  // Add to front of array
  history.unshift(visitedRestaurant);

  // Keep only latest 5 items
  const trimmedHistory = history.slice(0, 5);

  // Sort by timestamp descending
  trimmedHistory.sort((a: any, b: any) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Save back to localStorage
  localStorage.setItem("history", JSON.stringify(trimmedHistory));
}
