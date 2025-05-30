import { Bundle, Highlight, Item, NormalItem, Restaurant } from "@/types";

import {
  BUNDLE_IMAGE_BUCKET,
  HIGHLIGHT_IMAGE_BUCKET,
  ITEM_IMAGE_BUCKET,
  RESTAURANT_IMAGE_BUCKET,
} from "@/constants";

import { project_url, supabase } from "./supabase_client";
import { ItemUtils } from "./item_utils";

export class ImageUtils {
  static getHeroImageUrl = (restaurant: Restaurant | null) => {
    if (!restaurant) return null;
    return `${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/hero/${restaurant.id}`;
  };
  static getProfileImageUrl = (restaurant: Restaurant | null) => {
    if (!restaurant) return null;
    return `${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/profile/${restaurant.id}`;
  };
  static getBundleImageUrl = (bundle: Bundle | null) => {
    if (!bundle) return null;
    return `${project_url}/storage/v1/object/public/${BUNDLE_IMAGE_BUCKET}/${bundle.bundle_id}`;
  };
  static getHighlightImageUrl = (highlight: Highlight | null) => {
    if (!highlight) return null;
    const imageUrl = highlight.image_url_override;
    if (imageUrl) {
      return `${project_url}/storage/v1/object/public/${HIGHLIGHT_IMAGE_BUCKET}/${imageUrl}`;
    }
    return null;
  };

  static getItemImageUrl = (
    itemId: string | null | undefined,
    restaurant: Restaurant
  ): string | null => {
    if (!itemId) return "";

    const menuItem = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
    return `${project_url}/storage/v1/object/public/${ITEM_IMAGE_BUCKET}/${
      menuItem?.image_url || ""
    }`;
  };
}
