import { useEffect, useMemo, useState, useRef } from "react";
import { Plus, Trash2, Minus, Check } from "lucide-react";
import { titleCase } from "title-case";
import {
  Cart,
  Category,
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
import { isEqual, cloneDeep } from "lodash";
import { PolicyUtils } from "@/utils/policy_utils";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "./display_utils/image_fallback";
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
  const primaryColor = restaurant?.metadata.primaryColor;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);

  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  const cartItem = cart.find((cartItem) => cartItem.item.id === item.id);
  const quantity = cart.reduce(
    (total, cartItem) =>
      cartItem.item.id === item.id ? total + cartItem.quantity : total,
    0
  );

  const highlight =
    (onSelect === null && quantity > 0) ||
    (onSelect && isEqual(selected, item));
  if (!restaurant || !menuItem || menuItem.price == null) {
    return null;
  }
  let unavailable = false;
  if (ItemUtils.isItemUnavailable(item, restaurant)) {
    unavailable = true;
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

          {/* Modifier names */}
          {(() => {
            const modifierNames = ItemUtils.getItemModifierNames(
              item,
              restaurant
            );
            if (modifierNames.length > 0) {
              return (
                <p className="text-sm text-gray-500 custom-line-clamp-1">
                  {modifierNames.join(", ")}
                </p>
              );
            } else {
              return (
                <p className="text-sm text-gray-500 custom-line-clamp-1 show-at-400">
                  {(menuItem as NormalItem | PassItem)?.description}
                </p>
              );
            }
          })()}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="font-bold text-base">
              ${ItemUtils.priceItem(item, restaurant)?.toFixed(2)}
            </p>
            {purchaseDate && quantity === 0 && (
              <span className="text-xs text-gray-500 -mr-6 show-at-400 z-10">
                {convertUtcToLocal(purchaseDate, restaurant.metadata.timeZone)}
              </span>
            )}
          </div>

          {!onSelect && !unavailable && (
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
                  await addToCart(cloneDeep(item));
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

export function RedeemedTransaction({
  item,
  purchaseDate = null,
}: {
  item: Item;
  purchaseDate?: string | null;
}) {
  const { restaurant } = useRestaurant();
  if (!restaurant) {
    return null;
  }
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);

  if (!restaurant || !menuItem || menuItem.price == null) {
    return null;
  }

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 border-gray-200`}
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
          </div>

          {/* Modifier names */}
          {(() => {
            const modifierNames = ItemUtils.getItemModifierNames(
              item,
              restaurant
            );
            if (modifierNames.length > 0) {
              return (
                <p className="text-sm text-gray-500 custom-line-clamp-1">
                  {modifierNames.join(", ")}
                </p>
              );
            }
            return null;
          })()}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {purchaseDate && (
              <span className="text-sm text-gray-500 -mr-6 show-at-400  flex items-center gap-1">
                <span className="font-semibold text-gray-500">
                  Redeemed at:{" "}
                </span>
                <span className="font-semibold text-black">
                  {convertUtcToLocal(
                    purchaseDate,
                    restaurant.metadata.timeZone
                  )}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type LoyaltyRewardPolicyCardType = {
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  numPoints: number;
} | null;

export function LoyaltyRewardPolicyCard({
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
  const primaryColor = restaurant.metadata.primaryColor;
  let card: LoyaltyRewardPolicyCardType = null;
  if (policy.definition.action.type === "add_to_user_credit") {
    card = {
      name: PolicyUtils.getPolicyName(policy, restaurant),
      description:
        PolicyUtils.policyToStringDescription(policy, restaurant)
          .actionDescription || "",
      price: policy.definition.action.amount,
      image_url: null,
      numPoints: numPoints,
    };
  } else if (policy.definition.action.type === "add_item") {
    const itemIds = ItemUtils.policyItemSpecificationsToItemIds(
      policy.definition.action.items,
      restaurant
    );
    if (itemIds.length <= 0) {
      return null;
    }
    const itemId = itemIds[0];
    card = {
      name: PolicyUtils.getPolicyName(policy, restaurant),
      description:
        PolicyUtils.policyToStringDescription(policy, restaurant)
          .actionDescription || "",
      price: null,
      image_url: ImageUtils.getItemImageUrl(itemId, restaurant),
      numPoints: numPoints,
    };
  } else {
    card = {
      name: PolicyUtils.getPolicyName(policy, restaurant),
      description:
        PolicyUtils.policyToStringDescription(policy, restaurant)
          .actionDescription || "",
      price: null,
      image_url: "fallback",
      numPoints: numPoints,
    };
  }

  const isUsable = PolicyUtils.isPolicyUsable(policy, restaurant);

  if (!card || !restaurant || !isUsable) {
    return null;
  }

  return (
    <div
      className={`flex-none flex items-stretch m-3 border p-3 rounded-3xl bg-white transition-colors duration-300 border-gray-200`}
    >
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <ImageFallback
          src={card.image_url}
          alt={card.name}
          className="h-full w-full object-cover"
          restaurant={restaurant}
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-base">{card.name}</h4>
          </div>
          <p className="text-sm text-gray-500 custom-line-clamp-2 show-at-400">
            {card.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: primaryColor }}>
              {numPoints} points
            </p>
            {card.price != null && (
              <p className="text-sm text-gray-500 line-through show-at-400">
                ${card.price?.toFixed(2)}
              </p>
            )}
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
  const primaryColor = restaurant.metadata.primaryColor;
  const menuItem = ItemUtils.getMenuItemFromItemId(item.id, restaurant);
  const isPass = ItemUtils.isPassItem(item.id, restaurant);

  let unavailable = false;
  if (ItemUtils.isItemUnavailable(item, restaurant)) {
    unavailable = true;
  }

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

          {/* Modifier names */}
          {(() => {
            const modifierNames = ItemUtils.getItemModifierNames(
              item,
              restaurant
            );
            if (modifierNames.length > 0) {
              return (
                <p className="text-sm text-gray-500 custom-line-clamp-2">
                  {modifierNames.join(", ")}
                </p>
              );
            }
            return null;
          })()}
        </div>
        {!unavailable ? (
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
        ) : (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              This item is not currently available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const DrinkList = ({
  label,
  slideToFilter,
  restaurant,
  itemSpecifications,
  labelOrder,
  selected = null,
  onSelect = null,
}: {
  label: string | null;
  slideToFilter: (filter: string) => void;
  restaurant: Restaurant;
  itemSpecifications: ItemSpecification[];
  labelOrder?: string[];
  selected?: Item | null;
  onSelect?: ((item: Item) => Promise<void>) | null;
}) => {
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const userScroll = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const label = entry.target.getAttribute("data-label");
          if (entry.isIntersecting && label && !userScroll.current) {
            slideToFilter(label);
          }
        });
      },
      {
        root: null, // viewport
        threshold: 0.01,
        rootMargin: "100px 0px -100% 0px",
      }
    );
    const elements = Array.from(labelRefs.current.values());
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToLabel = (menuLabel: string) => {
    userScroll.current = true;
    const el = labelRefs.current.get(menuLabel);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 190, behavior: "smooth" });
    }
    setTimeout(() => {
      userScroll.current = false;
    }, 1000);
  };

  const drinks: { id: string; label: string }[] = useMemo(() => {
    let allItemIds: { id: string; label: string }[] = [];
    const labelMap = restaurant.labelMap;
    for (const key of Object.keys(labelMap)) {
      const itemIds = ItemUtils.getAllItemsInCategory(
        labelMap[key],
        restaurant
      );
      for (const id of itemIds) {
        if (ItemUtils.isItemUnavailable({ id }, restaurant)) continue;
        allItemIds.push({ id, label: key });
      }
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

  const sortedLabels = labelOrder || Object.keys(restaurant.labelMap);

  sortedLabels.sort((a, b) => {
    const categoryA = ItemUtils.getMenuItemFromItemId(
      restaurant.labelMap[a],
      restaurant
    ) as Category;
    const categoryB = ItemUtils.getMenuItemFromItemId(
      restaurant.labelMap[b],
      restaurant
    ) as Category;
    return (categoryB?.sortWeight || 0) - (categoryA?.sortWeight || 0);
  });

  return (
    <div className="space-y-4  overflow-y-auto scroll-smooth no-scrollbar -mx-5">
      <div>
        {sortedLabels.map((menuLabel) => {
          const drinksForLabel = drinks.filter(
            (drink) => drink.label === menuLabel
          );
          if (drinksForLabel.length > 0) {
            return (
              <div key={menuLabel}>
                <div
                  data-label={menuLabel}
                  ref={(el) => {
                    if (el) {
                      labelRefs.current.set(menuLabel, el);
                    }
                  }}
                  style={{ height: 1 }}
                />
                <h3 className="text-xl font-bold ml-6 mt-4 pb-1 sticky top-0 bg-white z-5">
                  {menuLabel.toUpperCase()}
                </h3>
                <div className="space-y-2">
                  {drinksForLabel.map(({ id }) => (
                    <DrinkItem
                      key={id}
                      item={{ id: id }}
                      onSelect={onSelect}
                      selected={selected}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
