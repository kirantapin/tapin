import { Bundle, Highlight, Restaurant } from "@/types";

import {
  BUNDLE_IMAGE_BUCKET,
  HIGHLIGHT_IMAGE_BUCKET,
  RESTAURANT_IMAGE_BUCKET,
} from "@/constants";

import { project_url, supabase } from "./supabase_client";

export class ImageUtils {
  static getHeroImageUrl = (restaurant: Restaurant | null) => {
    if (!restaurant) return null;
    return `${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant.id}_hero`;
  };
  static getProfileImageUrl = (restaurant: Restaurant | null) => {
    if (!restaurant) return null;
    return `${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant.id}_profile`;
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
}
