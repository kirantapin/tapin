import { useEffect, useMemo, useState, useRef } from "react";
import { Plus, Trash2, Minus, Check, Sparkles } from "lucide-react";
import {
  HOUSE_MIXER_LABEL,
  LIQUOR_MENU_TAG,
  SHOTS_SHOOTERS_LABEL,
} from "@/constants";
import { titleCase } from "title-case";
import {
  Cart,
  Item,
  ItemSpecification,
  NormalItem,
  PassItem,
  Policy,
  Restaurant,
} from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { useAuth } from "@/context/auth_context";
import { convertUtcToLocal } from "@/utils/time";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { getSuggestedMenuItems } from "./display_utils/suggested_menu_items";
import { isEqual } from "lodash";
import { PolicyUtils } from "@/utils/policy_utils";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "./display_utils/image_fallback";
import LiquorForm from "./liquor_form";
import { useRestaurant } from "@/context/restaurant_context";

export function DrinkItem({
  item,
  purchaseDate = null,
  onSelect = null,
  selected = null,
}: {
  item: Item;
  purchaseDate?: string | null;
  onSelect?: ((item: Item) => void) | null;
  selected?: Item | null;
}) {
  const { restaurant } = useRestaurant();
  const [loading, setLoading] = useState(false);
  const { state, addToCart, removeFromCart } = useBottomSheet();
  if (!restaurant) {
    return null;
  }
  const cart = state.cart as Cart;
  const primaryColor = restaurant?.metadata.primaryColor as string;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);

  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  const cartItem = cart.find((cartItem) => cartItem.item.id === item.id);
  const quantity = cart.reduce(
    (total, cartItem) =>
      isEqual(cartItem.item, item) ? total + cartItem.quantity : total,
    0
  );

  const highlight =
    (onSelect === null && quantity > 0) ||
    (onSelect && isEqual(selected, item));
  if (!restaurant || !menuItem || !menuItem.price) {
    return null;
  }

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 ${
        highlight ? undefined : "border-gray-200"
      }`}
      style={{
        borderColor: highlight ? primaryColor : undefined,
      }}
      onClick={() => {
        if (onSelect) {
          onSelect(item);
        }
      }}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <ImageFallback
          src={ImageUtils.getItemImageUrl(item.id, restaurant)}
          alt={menuItem?.name}
          className="h-full w-full object-cover"
          restaurant={restaurant}
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-base">
              {titleCase(ItemUtils.getItemName(item, restaurant))}
            </h4>
            {isPass && (
              <span className="text-xs text-gray-500 ml-2">
                {(menuItem as PassItem)?.for_date}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 custom-line-clamp-1 show-at-400">
            {(menuItem as NormalItem | PassItem)?.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="font-bold text-base">
              ${ItemUtils.priceItem(item, restaurant)?.toFixed(2)}
            </p>
            {purchaseDate && quantity === 0 && (
              <span className="text-xs text-gray-500 -mr-6 show-at-400">
                {convertUtcToLocal(purchaseDate)}
              </span>
            )}
          </div>

          {!onSelect && (
            <div className="flex items-center bg-white rounded-full px-1 py-1 relative">
              <div
                className={`flex items-center transition-all duration-300 ${
                  quantity > 0
                    ? "translate-x-0"
                    : "translate-x-8 opacity-0 pointer-events-none"
                }`}
              >
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
                {loading && quantity > 0 ? (
                  <div className="mx-3 animate-spin rounded-full h-4 w-4 border-2 border-gray-800 border-t-transparent" />
                ) : (
                  <span className="mx-3 text-sm font-semibold text-gray-800">
                    {quantity}
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  await addToCart(item);
                  setLoading(false);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
              >
                {loading && quantity === 0 ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          )}
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
      image_url: ImageUtils.getProfileImageUrl(restaurant),
    } as NormalItem;
  }
  if (policy.definition.action.type === "add_item") {
    const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
      policy.definition.action.items,
      restaurant
    );
    itemId = itemIds[0];
    menuItem = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
  }

  if (!menuItem || !restaurant) {
    return null;
  }
  const isPass = itemId ? ItemUtils.isPassItem(itemId, restaurant) : false;

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 border-gray-200`}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <ImageFallback
          src={ImageUtils.getItemImageUrl(itemId, restaurant)}
          alt={menuItem?.name}
          className="h-full w-full object-cover"
          restaurant={restaurant}
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-base">
              {titleCase(PolicyUtils.getPolicyName(policy, restaurant))}
            </h4>
            {isPass && (
              <span className="text-xs text-gray-500 ml-2">
                {(menuItem as PassItem)?.for_date}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 custom-line-clamp-1 show-at-400">
            {(menuItem as NormalItem | PassItem)?.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: primaryColor }}>
              {numPoints} points
            </p>
            <p className="text-sm text-gray-500 line-through show-at-400">
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
                  <Check className="w-4 h-4 text-[#40C4AA]" />
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

  return (
    <div className="flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white">
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <ImageFallback
          src={ImageUtils.getItemImageUrl(item.id, restaurant)}
          alt={menuItem?.name || ""}
          className="h-full w-full object-cover"
          restaurant={restaurant}
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-base">
              {titleCase(ItemUtils.getItemName(item, restaurant))}
            </h4>
            {isPass && (
              <span className="text-xs text-gray-500 ml-2">
                {(menuItem as PassItem)?.for_date}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 custom-line-clamp-1 show-at-400">
            {(menuItem as NormalItem | PassItem)?.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <button
              onClick={async () => {
                decrement();
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
                increment();
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
  itemSpecifications,
  selected = null,
  onSelect = null,
}: {
  cart: Cart;
  label: string | null;
  restaurant: Restaurant;
  addToCart: (item: Item, showToast?: boolean) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  itemSpecifications: ItemSpecification[];
  selected?: Item | null;
  onSelect?: ((item: Item) => Promise<void>) | null;
}) => {
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const [showLiquorForm, setShowLiquorForm] = useState<string[]>([]);

  const scrollToLabel = (menuLabel: string) => {
    const el = labelRefs.current.get(menuLabel);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 190, behavior: "smooth" });
    }
  };

  const drinks: { id: string; label: string }[] = useMemo(() => {
    let allItemIds: { id: string; label: string }[] = [];
    const labelMap = restaurant.labelMap;
    for (const key of Object.keys(labelMap)) {
      const itemIds = ItemUtils.getAllItemsInCategory(
        labelMap[key],
        restaurant
      );
      itemIds.forEach((id) => allItemIds.push({ id: id, label: key }));
    }
    if (itemSpecifications.length > 0) {
      allItemIds = allItemIds.filter(({ id }) => {
        const path = restaurant.menu[id].path;
        return itemSpecifications.some((spec) => path.includes(spec));
      });
    }
    return allItemIds;
  }, [restaurant, itemSpecifications]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (label) {
      scrollToLabel(label);
    }
  }, [label]);

  const houseMixerFilters = [
    (object: any) => {
      return object.modifiers?.some((modifier: string) =>
        modifier.toLowerCase().includes("with")
      );
    },
    (object: any) => {
      return restaurant.menu[object.id].path.includes(LIQUOR_MENU_TAG);
    },
  ];

  const shotsShootersFilters = [
    (object: any) => {
      return !object.modifiers?.some((modifier: string) =>
        modifier.toLowerCase().includes("with")
      );
    },
    (object: any) => {
      return restaurant.menu[object.id].path.includes(LIQUOR_MENU_TAG);
    },
  ];

  return (
    <div className="space-y-4  overflow-y-auto scroll-smooth no-scrollbar -mx-5">
      <div className="pb-20">
        {Object.keys(restaurant.labelMap).map((menuLabel) => {
          const drinksForLabel = drinks.filter(
            (drink) => drink.label === menuLabel
          );
          if (drinksForLabel.length > 0) {
            return (
              <div
                key={menuLabel}
                ref={(el) => {
                  if (el) {
                    labelRefs.current.set(menuLabel, el);
                  }
                }}
              >
                <h3 className="text-xl font-bold ml-6 mt-4 pb-1 sticky top-0 bg-white z-5">
                  {menuLabel.toUpperCase()}
                </h3>
                <div className="space-y-2">
                  {menuLabel === HOUSE_MIXER_LABEL ||
                  menuLabel === SHOTS_SHOOTERS_LABEL ? (
                    <div className="space-y-4">
                      <div
                        className="px-6 mt-2 rounded-2xl"
                        style={{
                          borderColor: restaurant.metadata
                            .primaryColor as string,
                        }}
                      >
                        <div
                          onClick={() => {
                            setShowLiquorForm(
                              showLiquorForm.includes(menuLabel)
                                ? showLiquorForm.filter(
                                    (label) => label !== menuLabel
                                  )
                                : [...showLiquorForm, menuLabel]
                            );
                          }}
                          className="w-full text-center text-md text-gray-500 rounded-2xl py-3 px-4 mx-auto block flex items-center justify-center font-semibold"
                          style={{
                            color: "white",
                            backgroundColor: restaurant.metadata
                              .primaryColor as string,
                          }}
                        >
                          <Sparkles className="w-6 h-6 mr-2 text-white" />
                          Make A{" "}
                          {menuLabel === HOUSE_MIXER_LABEL
                            ? "House Mixer"
                            : "Shot"}
                        </div>
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            showLiquorForm.includes(menuLabel)
                              ? "max-h-[1000px] opacity-100"
                              : "max-h-0 opacity-0 overflow-hidden"
                          }`}
                        >
                          <LiquorForm
                            type={menuLabel}
                            restaurant={restaurant}
                            primaryColor={
                              restaurant.metadata.primaryColor as string
                            }
                            afterAdd={async (item) => {
                              if (onSelect) {
                                await onSelect(item);
                              } else {
                                await addToCart(item, true);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {getSuggestedMenuItems({
                        type: menuLabel,
                        filters:
                          menuLabel === HOUSE_MIXER_LABEL
                            ? houseMixerFilters
                            : shotsShootersFilters,
                        restaurant: restaurant,
                        whiteListCategories: [LIQUOR_MENU_TAG],
                      }).map((item) => (
                        <DrinkItem
                          key={item.id}
                          item={item}
                          purchaseDate={null}
                          onSelect={onSelect}
                          selected={selected}
                        />
                      ))}
                    </div>
                  ) : (
                    drinksForLabel.map(({ id }) => (
                      <DrinkItem
                        key={id}
                        item={{ id: id, modifiers: [] }}
                        onSelect={onSelect}
                        selected={selected}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
