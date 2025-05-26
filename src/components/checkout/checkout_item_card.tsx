import {
  CartItem,
  DealEffectPayload,
  Item,
  NormalItem,
  PassItem,
  Policy,
  Restaurant,
} from "@/types";
import { modifiedItemFlair } from "@/utils/pricer";
import { project_url } from "@/utils/supabase_client";
import { ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "../display_utils/image_fallback";

export function CheckoutItemCard({
  item,
  restaurant,
  dealEffect,
  addToCart,
  removeFromCart,
  inlineRecommendation = null,
}: {
  item: CartItem;
  restaurant: Restaurant;
  dealEffect: DealEffectPayload;
  addToCart: (item: Item, showToast?: boolean) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  inlineRecommendation: {
    cartId: number;
    flair: string;
    policy: Policy;
  } | null;
}) {
  const itemInfo = ItemUtils.getMenuItemFromItemId(
    item.item.id,
    restaurant
  ) as NormalItem;
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();

  const { oldPrice, currentPrice, discountDescription } = modifiedItemFlair(
    item,
    restaurant,
    dealEffect
  );
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-3">
        <ImageFallback
          src={itemInfo?.image_url || ""}
          alt={ItemUtils.getItemName(item.item, restaurant)}
          className="w-20 h-20  object-cover bg-gray-100"
          restaurant={restaurant}
        />

        {/* Info */}
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {ItemUtils.getItemName(item.item, restaurant)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-md text-gray-600 font-medium">
              ${currentPrice.toFixed(2)}
            </span>
            {oldPrice && (
              <span className="text-md font-medium text-gray-400 line-through">
                ${oldPrice?.toFixed(2)}
              </span>
            )}
            {discountDescription && (
              <span
                className="bg-[#cda852] text-xs text-white px-2 py-0.5 rounded font-semibold"
                style={{
                  background: restaurant?.metadata.primaryColor
                    ? `linear-gradient(45deg, 
    ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
    ${adjustColor(restaurant.metadata.primaryColor as string, 20)}
  )`
                    : undefined,
                }}
              >
                {discountDescription}
              </span>
            )}
          </div>
          {inlineRecommendation && inlineRecommendation.cartId === item.id && (
            <div
              className="mt-2"
              onClick={() => {
                handlePolicyClick(
                  inlineRecommendation.policy,
                  userOwnershipMap
                );
              }}
            >
              <span
                className="text-sm font-medium text-gray-900 rounded-full py-1 flex items-center gap-1"
                style={{ color: restaurant?.metadata.primaryColor as string }}
              >
                {inlineRecommendation.flair}
                <ChevronRight className="w-4 h-4 -ml-1" />
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Right: Quantity stepper */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-full px-1 py-1">
        <button
          onClick={async () => {
            setLoading(true);
            await removeFromCart(item.id);
            setLoading(false);
          }}
          className="bg-white rounded-full p-1"
        >
          {item.quantity === 1 ? (
            <Trash2
              className="w-5 h-5"
              style={{ color: restaurant.metadata.primaryColor as string }}
            />
          ) : (
            <Minus className="w-5 h-5 text-black" />
          )}
        </button>

        <span className="text-sm font-medium text-gray-900">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-800 border-t-transparent" />
          ) : (
            item.quantity
          )}
        </span>

        <button
          onClick={async () => {
            setLoading(true);
            await addToCart(item.item);
            setLoading(false);
          }}
          className="bg-white rounded-full p-1"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
}
