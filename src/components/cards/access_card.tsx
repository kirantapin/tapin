import { Cart, CartItem, DealEffectPayload, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { getMenuItemFromItemId, modifiedItemFlair } from "@/utils/pricer";
import { isEqual } from "lodash";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { titleCase } from "title-case";
import { generateGradientColors } from "@/utils/color";
interface CardProps {
  cart: Cart;
  cartItem: CartItem | null;
  restaurant: Restaurant;
  itemId: string;
  addToCart;
  removeFromCart;
  modifiedFlair: {
    oldPrice: number | null;
    currentPrice: number;
    discountDescription: string | null;
  } | null;
}

export default function Card({
  cart,
  cartItem,
  restaurant,
  itemId,
  addToCart,
  removeFromCart,
  modifiedFlair,
}: CardProps) {
  const colors = generateGradientColors(restaurant.metadata.primaryColor);
  const primaryColor = restaurant.metadata.primaryColor;
  let itemInfo = null;
  let quantity = 0;
  let name = null;
  const [loading, setLoading] = useState(false);

  if (cartItem) {
    quantity = cartItem.quantity || 0;
    itemInfo = ItemUtils.getMenuItemFromItemId(cartItem.item.id, restaurant);
    name = itemInfo?.name;
    itemId = cartItem.item.id;
  } else {
    itemInfo = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
    cartItem = cart.find((item) => isEqual(item.item.id, itemId)) || null;
    quantity = cartItem?.quantity || 0;
    name = itemInfo?.name;
  }

  return (
    <div className="w-full aspect-[9/5] rounded-3xl p-3 sm:p-4 relative overflow-hidden text-white my-4 enhance-contrast">
      <div
        style={{
          background: `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`,
        }}
        className="absolute inset-0"
      />

      {/* Tap In icon overlay in bottom right */}
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 transform translate-x-6 translate-y-6">
        <img
          src="/tapin_icon.svg"
          alt="Tap In"
          className="w-full h-full scale-x-[-1]"
        />
      </div>

      {/* Date and Amount Remaining in top right corner */}
      <div className="absolute top-3 sm:top-4 right-4 sm:right-6 text-right">
        <div className="text-sm text-white/150 font-[Gilroy]">
          {itemInfo?.for_date}
        </div>
        <div className="text-md text-white font-bold mt-1">
          {itemInfo?.amount_remaining} Left
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col pb-20">
        {" "}
        {/* pb-20 ensures space for bottom content */}
        <div className="space-y-1 sm:space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm text-white/80">
              {restaurant.name}
            </p>
            <h2 className="text-2xl sm:text-2xl font-semibold">
              {titleCase(name)}
            </h2>
          </div>
        </div>
      </div>

      {/* Bottom pinned price + buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
        <div>
          <p className="text-base sm:text-sm text-white">
            Price:{" "}
            <span className="font-normal">
              $
              {modifiedFlair
                ? modifiedFlair?.currentPrice.toFixed(2)
                : itemInfo?.price.toFixed(2)}
            </span>
          </p>
          {modifiedFlair?.oldPrice && (
            <span className="text-md font-medium text-gray-300 line-through">
              ${modifiedFlair?.oldPrice?.toFixed(2)}
            </span>
          )}
          {modifiedFlair?.discountDescription && (
            <span
              className="bg-[#cda852] text-xs text-white px-2 py-0.5 rounded font-semibold ml-2"
              style={{
                backgroundColor: "white",
                color: primaryColor,
              }}
            >
              {modifiedFlair?.discountDescription}
            </span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-white rounded-full px-1 py-1">
            <button
              onClick={async () => {
                setLoading(true);
                console.log("removing", cartItem?.id);
                await removeFromCart(cartItem?.id, {
                  quantity: quantity - 1,
                });
                setLoading(false);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {quantity > 1 ? (
                <Minus className="w-4 h-4 text-white" />
              ) : (
                <Trash2 className="w-4 h-4 text-white" />
              )}
            </button>
            {loading ? (
              <div className="mx-3 animate-spin rounded-full h-4 w-4 border-2 border-gray-800 border-t-transparent" />
            ) : (
              <span className="mx-3 text-sm font-semibold text-gray-800">
                {quantity}
              </span>
            )}
            <button
              onClick={async () => {
                setLoading(true);
                await addToCart({ id: itemId, modifiers: [] });
                setLoading(false);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            className="h-6 w-6 rounded-full flex items-center justify-center text-black"
            style={{ backgroundColor: "white" }}
            onClick={async () => {
              setLoading(true);
              await addToCart({ id: itemId, modifiers: [] });
              setLoading(false);
            }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
