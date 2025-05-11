import { Cart, CartItem, Item, PassItem, Policy, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { titleCase } from "title-case";
import { generateGradientColors } from "@/utils/color";
import { useBottomSheet } from "@/context/bottom_sheet_context";
interface CardProps {
  cart: Cart;
  cartItem: CartItem | null;
  restaurant: Restaurant;
  itemId: string;
  addToCart: (item: Item) => void;
  removeFromCart: (itemId: number) => void;
  modifiedFlair: {
    oldPrice: number | null;
    currentPrice: number;
    discountDescription: string | null;
  } | null;
  inlineRecommendation: {
    cartId: number;
    flair: string;
    policy: Policy;
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
  inlineRecommendation = null,
}: CardProps) {
  const colors = generateGradientColors(
    restaurant.metadata.primaryColor as string
  );

  const primaryColor = restaurant.metadata.primaryColor as string;
  let itemInfo = null;
  let quantity = 0;
  let name = null;
  const [loading, setLoading] = useState(false);
  const { openPolicyModal } = useBottomSheet();

  if (cartItem) {
    quantity = cartItem.quantity || 0;
    itemInfo = ItemUtils.getMenuItemFromItemId(
      cartItem.item.id,
      restaurant
    ) as PassItem;
    name = itemInfo?.name;
    itemId = cartItem.item.id;
  } else {
    itemInfo = ItemUtils.getMenuItemFromItemId(itemId, restaurant) as PassItem;
    cartItem = cart.find((cartItem) => cartItem.item.id === itemId) || null;
    quantity = cart.reduce(
      (total, cartItem) =>
        cartItem.item.id === itemId ? total + cartItem.quantity : total,
      0
    );
    name = itemInfo?.name;
  }

  return (
    <div className="w-full aspect-[9/5] rounded-3xl p-3 sm:p-4 relative overflow-hidden text-white my-4 enhance-contrast">
      <div
        style={{
          background: `linear-gradient(to right, ${colors.via}, ${colors.from})`,
          // backgroundColor: restaurant?.metadata.primaryColor as string,
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
        <div
          className="text-sm text-white/150"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {itemInfo?.for_date}
        </div>
        <div className="text-md text-white font-bold mt-1">
          {itemInfo?.amount_remaining !== null &&
            `${itemInfo?.amount_remaining} Left`}
        </div>
      </div>

      {/* Main content */}
      <div className="pt-2 pl-2 relative z-10 h-full flex flex-col pb-20">
        {" "}
        {/* pb-20 ensures space for bottom content */}
        <div className="space-y-1 sm:space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm text-white font-semibold">
              {restaurant.name}
            </p>
            <h2 className="text-3xl sm:text-2xl font-bold">
              {titleCase(name)}
            </h2>
          </div>
        </div>
      </div>

      {/* Bottom pinned price + buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
        <div>
          {inlineRecommendation &&
            inlineRecommendation?.cartId === cartItem?.id && (
              <div
                className="mb-2 inline-block"
                onClick={() => {
                  openPolicyModal(inlineRecommendation.policy, null);
                }}
              >
                <span
                  className="text-sm font-medium text-white/90 flex items-center gap-1 bg-white rounded-md py-1 px-2 font-semibold"
                  style={{ color: primaryColor }}
                >
                  {inlineRecommendation.flair}
                  <ChevronRight className="w-4 h-4 -ml-1" />
                </span>
              </div>
            )}
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
                if (!cartItem) return;
                setLoading(true);
                console.log("removing", cartItem.id);
                await removeFromCart(cartItem.id);
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
            className="py-[5px] px-4 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-white"
            style={{
              width: "110px",
              color: primaryColor,
            }} // adjust as needed
            onClick={async () => {
              setLoading(true);
              await addToCart({ id: itemId, modifiers: [] });
              setLoading(false);
            }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            ) : (
              "Add to Cart"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
