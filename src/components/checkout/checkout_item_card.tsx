import { CartItem, DealEffectPayload, Item, Restaurant } from "@/types";
import { itemToStringDescription } from "@/utils/parse";
import { modifiedItemFlair } from "@/utils/pricer";
import { project_url } from "@/utils/supabase_client";
import { Minus, Plus, Trash2 } from "lucide-react";

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
  const itemPath = item.item.path;
  const itemInfo = itemPath.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
    restaurant.menu
  );

  const { oldPrice, currentPrice, discountDescription } = modifiedItemFlair(
    item,
    restaurant,
    dealEffect
  );

  return (
    <div className="flex items-center justify-between py-4">
      {/* Left: Image and info */}
      <div className="flex items-start gap-3">
        {/* Image */}
        <img
          src={
            itemInfo.imageUrl ||
            `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
          }
          alt={itemToStringDescription(item.item)}
          className="w-20 h-20 rounded-md object-cover bg-gray-100"
        />

        {/* Info */}
        <div>
          <p className="text-xl font-semibold text-gray-900">
            {itemToStringDescription(item.item)}
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
                className="bg-[#cda852] text-sm bg-yellow-500 text-white px-2 py-0.5 rounded font-semibold"
                style={{ backgroundColor: restaurant.metadata.primaryColor }}
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
          onClick={() => removeFromCart(item.id)}
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
          {item.quantity}
        </span>

        <button
          onClick={() => addToCart(item.item)}
          className="bg-white rounded-full p-1"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
}
