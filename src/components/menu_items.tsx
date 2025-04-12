import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Minus } from "lucide-react";
import {
  HOUSE_MIXER_LABEL,
  MENU_DISPLAY_MAP,
  PASS_MENU_TAG,
  SHOTS_SHOOTERS_LABEL,
} from "@/constants";
import LiquorForm from "./liquor_form";
import { titleCase } from "title-case";
import { Cart, Item, Restaurant, SingleMenuItem } from "@/types";
import { project_url } from "@/utils/supabase_client";
import { ItemUtils } from "@/utils/item_utils";

export function DrinkItem({
  key,
  cart,
  restaurant,
  addToCart,
  removeFromCart,
  itemId,
}: {
  key: string;
  cart: Cart;
  restaurant: Restaurant;
  addToCart: (item: Item) => Promise<void>;
  removeFromCart: (item: Item) => Promise<void>;
  itemId: string;
}) {
  const primaryColor = restaurant.metadata.primaryColor as string;
  const menuItem = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
  const isPass = ItemUtils.isPassItem(itemId, restaurant);

  const cartItem = cart.find((item) => item.item.id === itemId);
  const quantity = cart.reduce(
    (total, item) => (item.item.id === itemId ? total + item.quantity : total),
    0
  );

  const [loading, setLoading] = useState(false);
  console.log(itemId, quantity, loading);
  return (
    <div className="flex-none min-w-[14rem] flex items-stretch m-3 border p-3 rounded-3xl bg-white">
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 p-3">
        <img
          src={
            menuItem?.image_url ||
            `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
          }
          alt={menuItem?.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base">{titleCase(menuItem?.name)}</h3>
            {isPass && (
              <span className="text-xs text-gray-500 ml-2">
                {menuItem?.for_date}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 custom-line-clamp">
            {menuItem?.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-base">${menuItem?.price?.toFixed(2)}</p>

          {quantity > 0 ? (
            <div className="flex items-center bg-white rounded-full px-3 py-1 ">
              <button
                onClick={async () => {
                  setLoading(true);
                  await removeFromCart(cartItem?.id);
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
                  await addToCart({
                    id: itemId,
                    modifiers: [],
                  });
                  setLoading(false);
                }}
                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              className="h-7 w-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
              onClick={async () => {
                setLoading(true);
                await addToCart({
                  id: itemId,
                  modifiers: [],
                });
                setLoading(false);
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const DrinkList = ({
  cart,
  label,
  restaurant,
  addToCart,
  removeFromCart,
  primaryColor,
}: {
  cart: Cart;
  label: string;
  restaurant: Restaurant;
  addToCart;
  removeFromCart;
  primaryColor: string;
}) => {
  function getNestedObject(label, menu) {
    if (label === HOUSE_MIXER_LABEL || label === SHOTS_SHOOTERS_LABEL) {
      return {};
    } else {
      const categoryId = MENU_DISPLAY_MAP[label];
      return ItemUtils.getAllItemsInCategory(categoryId, restaurant);
    }
  }
  const drinks: string[] = useMemo(() => {
    return getNestedObject(label, restaurant.menu);
  }, [label, restaurant.menu]);

  return (
    <div className="space-y-4">
      {label === HOUSE_MIXER_LABEL || label === SHOTS_SHOOTERS_LABEL ? (
        // <LiquorForm
        //   type={label}
        //   menu={restaurant.menu}
        //   addToCart={addToCart}
        //   primaryColor={primaryColor}
        // />
        <div>
          <h1>Liquor Form</h1>
        </div>
      ) : (
        <div>
          {drinks.map((id, index) => (
            <DrinkItem
              key={id}
              cart={cart}
              restaurant={restaurant}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              itemId={id}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
