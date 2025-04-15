import { CartItem, DealEffectPayload, Item, Restaurant } from "@/types";
import { itemToStringDescription } from "@/utils/parse";
import { modifiedItemFlair } from "@/utils/pricer";
import { project_url } from "@/utils/supabase_client";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";
export function CheckoutItemCard({
  item,
  restaurant,
  dealEffect,
  addToCart,
  removeFromCart,
}: {
  item: CartItem;
  restaurant: Restaurant;
  dealEffect: DealEffectPayload;
  addToCart: (item: Item) => void;
  removeFromCart: (itemId: number) => void;
}) {
  const itemInfo = ItemUtils.getMenuItemFromItemId(item.item.id, restaurant);

  const { oldPrice, currentPrice, discountDescription } = modifiedItemFlair(
    item,
    restaurant,
    dealEffect
  );
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-between py-4">
      {/* Left: Image and info */}
      <div className="flex items-start gap-3">
        {/* Image */}
        <img
          src={
            itemInfo.image_url ||
            `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
          }
          alt={itemToStringDescription(item.item, restaurant)}
          className="w-20 h-20 rounded-md object-cover bg-gray-100"
        />

        {/* Info */}
        <div>
          <p className="text-xl font-semibold text-gray-900">
            {itemToStringDescription(item.item, restaurant)}
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
