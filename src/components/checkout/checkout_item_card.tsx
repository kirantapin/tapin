import {
  CartItem,
  DealEffectPayload,
  Item,
  NormalItem,
  Policy,
  Restaurant,
} from "@/types";
import { modifiedItemFlair } from "@/utils/pricer";
import { ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ItemUtils } from "@/utils/item_utils";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { ImageFallback } from "../display_utils/image_fallback";
import { ImageUtils } from "@/utils/image_utils";

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
      <div className="flex items-start">
        <div className="w-20 h-20 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <ImageFallback
            src={ImageUtils.getItemImageUrl(item.item.id, restaurant)}
            alt={ItemUtils.getItemName(item.item, restaurant)}
            className="w-full h-full  object-cover"
            restaurant={restaurant}
          />
        </div>

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
                  background: restaurant?.metadata.primaryColor,
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
                style={{ color: restaurant?.metadata.primaryColor }}
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
              style={{ color: restaurant.metadata.primaryColor }}
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
