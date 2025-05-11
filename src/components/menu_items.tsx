import React, { useEffect, useMemo, useState, useRef } from "react";
import { Plus, Trash2, Minus, Check } from "lucide-react";
import {
  HOUSE_MIXER_LABEL,
  MENU_DISPLAY_MAP,
  PASS_MENU_TAG,
  SHOTS_SHOOTERS_LABEL,
} from "@/constants";
import LiquorForm from "./liquor_form";
import { titleCase } from "title-case";
import { Cart, Item, ItemSpecification, Policy, Restaurant } from "@/types";
import { project_url } from "@/utils/supabase_client";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";
import { useAuth } from "@/context/auth_context";
import { convertUtcToLocal } from "@/utils/time";

export function DrinkItem({
  cart,
  restaurant,
  addToCart,
  removeFromCart,
  item,
  purchaseDate = null,
}: {
  cart: Cart;
  restaurant: Restaurant;
  addToCart: (item: Item) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  item: Item;
  purchaseDate?: string | null;
}) {
  const primaryColor = restaurant.metadata.primaryColor as string;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);
  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  const cartItem = cart.find((cartItem) => cartItem.item.id === item.id);
  const quantity = cart.reduce(
    (total, cartItem) =>
      cartItem.item.id === item.id ? total + cartItem.quantity : total,
    0
  );

  const [loading, setLoading] = useState(false);
  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 ${
        quantity > 0 ? undefined : "border-gray-200"
      }`}
      style={{
        borderColor: quantity > 0 ? primaryColor : undefined,
      }}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 p-3">
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
            <h3 className="font-bold text-base">
              {titleCase(ItemUtils.getItemName(item, restaurant))}
            </h3>
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
          <div className="flex items-center gap-2">
            <p className="font-bold text-base">
              ${ItemUtils.priceItem(item, restaurant)?.toFixed(2)}
            </p>
            {purchaseDate && quantity === 0 && (
              <span className="text-xs text-gray-500">
                {convertUtcToLocal(purchaseDate)}
              </span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center bg-white rounded-full px-3 py-1 ">
              <button
                onClick={async () => {
                  if (cartItem?.id) {
                    setLoading(true);
                    await removeFromCart(cartItem?.id);
                    setLoading(false);
                  }
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
                  await addToCart(item);
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
              className="h-6 w-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
              onClick={async () => {
                setLoading(true);
                await addToCart(item);
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

export function SingleSelectionItem({
  restaurant,
  item,
  selected,
  onSelect,
}: {
  restaurant: Restaurant;
  item: Item;
  selected: boolean;
  onSelect: () => void;
}) {
  const primaryColor = restaurant.metadata.primaryColor as string;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);
  if (!menuItem || !menuItem.price) {
    return null;
  }
  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 ${
        selected ? undefined : "border-gray-200"
      }`}
      style={{
        borderColor: selected ? primaryColor : undefined,
      }}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 p-3">
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
            <h3 className="font-bold text-base">
              {titleCase(ItemUtils.getItemName(item, restaurant))}
            </h3>
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
          <div className="flex items-center gap-2">
            <p className="font-bold text-base">
              ${ItemUtils.priceItem(item, restaurant)?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoyaltyRewardItem({
  restaurant,
  policy,
  numPoints,
  onRedeem,
  isActive,
}: {
  restaurant: Restaurant;
  policy: Policy;
  numPoints: number;
  onRedeem: () => void;
  isActive: boolean;
}) {
  const { userData } = useAuth();
  const hasEnoughPoints = (userData?.points[restaurant.id] || 0) >= numPoints;
  const primaryColor = restaurant.metadata.primaryColor as string;
  let itemId = null;
  let menuItem = null;
  if (policy.definition.action.type === "add_to_user_credit") {
    menuItem = {
      name: `Earn  $${policy.definition.action.amount.toFixed(2)} of credit`,
      description: `Earn  $${policy.definition.action.amount.toFixed(
        2
      )} of credit`,
      price: policy.definition.action.amount,
      image_url: `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`,
    };
  }
  if (policy.definition.action.type === "add_free_item") {
    const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
      policy.definition.action.items,
      restaurant
    );
    itemId = itemIds[0];
    menuItem = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
  }
  const isPass = itemId ? ItemUtils.isPassItem(itemId, restaurant) : false;

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 border-gray-200`}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 p-3">
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
          <div className="flex items-center gap-2">
            <p className="font-bold text-base" style={{ color: primaryColor }}>
              {numPoints} points
            </p>
            <p className="text-sm text-gray-500 line-through">
              ${menuItem?.price?.toFixed(2)}
            </p>
          </div>
          {hasEnoughPoints && (
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                isActive
                  ? "bg-white text-black border border-gray-200"
                  : "text-white enhance-contrast"
              }`}
              style={
                !isActive
                  ? {
                      backgroundColor: primaryColor,
                    }
                  : undefined
              }
              onClick={onRedeem}
            >
              {isActive ? (
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Active</span>
                </div>
              ) : (
                "Redeem"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export function PreviousTransactionItem({
  key,
  currentQuantity,
  maxQuantity,
  restaurant,
  increment,
  decrement,
  item,
}: {
  key: string;
  currentQuantity: number;
  maxQuantity: number;
  restaurant: Restaurant;
  increment: () => void;
  decrement: () => void;
  item: Item;
}) {
  const primaryColor = restaurant.metadata.primaryColor as string;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);
  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  const [loading, setLoading] = useState(false);
  return (
    <div className="flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white">
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 p-3">
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
            <h3 className="font-bold text-base">
              {titleCase(ItemUtils.getItemName(item, restaurant))}
            </h3>
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
          <div className="flex items-center">
            <button
              onClick={async () => {
                setLoading(true);
                decrement();
                setLoading(false);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full mr-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <p>
              {currentQuantity} / {maxQuantity}
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                increment();
                setLoading(false);
              }}
              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full ml-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
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
  setActiveLabel,
}: {
  cart: Cart;
  label: string;
  restaurant: Restaurant;
  addToCart: (item: Item) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  setActiveLabel: (label: string) => void;
}) => {
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);

  const scrollToLabel = (menuLabel: string) => {
    const el = labelRefs.current.get(menuLabel);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 190, behavior: "smooth" });
    }
  };

  function getNestedObject(label: string) {
    const categoryId = MENU_DISPLAY_MAP[label];
    return ItemUtils.getAllItemsInCategory(categoryId, restaurant);
  }
  const drinks: { id: string; label: string }[] = useMemo(() => {
    const allItemIds: { id: string; label: string }[] = [];
    for (const key of Object.keys(MENU_DISPLAY_MAP)) {
      const itemIds = getNestedObject(key);
      itemIds.forEach((id) => allItemIds.push({ id: id, label: key }));
    }
    return allItemIds;
  }, [restaurant.menu]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (label) {
      scrollToLabel(label);
    }
  }, [label]);

  return (
    <div className="space-y-4  overflow-y-auto scroll-smooth no-scrollbar">
      <div className="pb-20">
        {Object.keys(MENU_DISPLAY_MAP).map((menuLabel) => {
          const drinksForLabel = drinks.filter(
            (drink) => drink.label === menuLabel
          );

          return drinksForLabel.length > 0 ? (
            <div
              key={menuLabel}
              ref={(el) => {
                if (el) {
                  labelRefs.current.set(menuLabel, el);
                }
              }}
            >
              <h3 className="text-lg font-bold mb-1 ml-3 mt-4 pb-2 sticky top-0 bg-white z-5">
                {menuLabel.toUpperCase()}
              </h3>
              <div className="space-y-2">
                {menuLabel === HOUSE_MIXER_LABEL ||
                menuLabel === SHOTS_SHOOTERS_LABEL ? (
                  <LiquorForm
                    type={menuLabel}
                    restaurant={restaurant}
                    addToCart={addToCart}
                    primaryColor={restaurant.metadata.primaryColor}
                  />
                ) : (
                  drinksForLabel.map(({ id }) => (
                    <DrinkItem
                      key={id}
                      cart={cart}
                      restaurant={restaurant}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                      item={{ id: id, modifiers: [] }}
                    />
                  ))
                )}
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
