import React from "react";
import {
  Ticket,
  GlassWater,
  Beer,
  HandCoins,
  Ban,
  Utensils,
  Martini,
  Wine,
} from "lucide-react"; // or your actual icon library
import { GradientIcon } from "@/utils/gradient";
import { Item, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import {
  BEER_AND_CIDER_TAG,
  BUNDLE_MENU_TAG,
  COCKTAILS_TAG,
  FOOD_MENU_TAG,
  LIQUOR_MENU_TAG,
  PASS_MENU_TAG,
  SPECIALTY_DRINKS_TAG,
} from "@/constants";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "./image_fallback";

interface GenericItemIconProps {
  itemId: string;
  restaurant: Restaurant;
  size?: number;
}

const GenericItemIcon: React.FC<GenericItemIconProps> = ({
  itemId,
  restaurant,
  size = 30,
}) => {
  const itemInfo = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
  const primaryColor = restaurant?.metadata.primaryColor as string;

  if (!itemInfo) {
    return <GradientIcon icon={Ban} primaryColor={primaryColor} size={size} />;
  }

  const path = restaurant.menu[itemId].path || [];

  if (path.includes(FOOD_MENU_TAG)) {
    return (
      <GradientIcon icon={Utensils} primaryColor={primaryColor} size={size} />
    );
  }
  if (path.includes(PASS_MENU_TAG)) {
    return (
      <GradientIcon icon={Ticket} primaryColor={primaryColor} size={size} />
    );
  }
  if (path.includes(BUNDLE_MENU_TAG)) {
    return (
      <GradientIcon icon={HandCoins} primaryColor={primaryColor} size={size} />
    );
  }
  if (path.includes(LIQUOR_MENU_TAG)) {
    return (
      <GradientIcon icon={GlassWater} primaryColor={primaryColor} size={size} />
    );
  }
  if (path.includes(SPECIALTY_DRINKS_TAG)) {
    return <GradientIcon icon={Wine} primaryColor={primaryColor} size={size} />;
  }
  if (path.includes(COCKTAILS_TAG)) {
    return (
      <GradientIcon icon={Martini} primaryColor={primaryColor} size={size} />
    );
  }
  if (path.includes(BEER_AND_CIDER_TAG)) {
    return <GradientIcon icon={Beer} primaryColor={primaryColor} size={size} />;
  }
  return (
    <ImageFallback
      src={ImageUtils.getItemImageUrl(itemId, restaurant)}
      alt=""
      className="w-full h-full object-cover"
      style={{ width: size, height: size, padding: 0 }}
      restaurant={restaurant}
    />
  );
};

export default GenericItemIcon;
