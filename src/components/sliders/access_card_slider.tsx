import { useState, useRef, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import {
  Cart,
  CartItem,
  DealEffectPayload,
  Item,
  PassItem,
  Policy,
  Restaurant,
} from "@/types";
import { PASS_MENU_TAG } from "@/constants";
import { modifiedItemFlair } from "@/utils/pricer";
import { ItemUtils } from "@/utils/item_utils";

const AccessCardSlider = ({
  cart,
  restaurant,
  addToCart,
  removeFromCart,
  displayCartPasses = false,
  dealEffect = null,
  inlineRecommendation = null,
}: {
  cart: Cart;
  restaurant: Restaurant;
  addToCart: (item: Item, showToast?: boolean) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  displayCartPasses: boolean;
  dealEffect: DealEffectPayload | null;
  inlineRecommendation?: {
    cartId: number;
    flair: string;
    policy: Policy;
  } | null;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to update active card based on scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const cardWidth = scrollContainerRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  // Scroll to a specific card when clicking a dot
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  const flatAccessCards = useMemo(() => {
    const flattened = [];

    if (displayCartPasses) {
      for (const cartItem of cart) {
        const item = cartItem.item;
        if (ItemUtils.isPassItem(item.id, restaurant)) {
          flattened.push(cartItem);
        }
      }
      return flattened;
    }

    const itemIds = ItemUtils.getAllItemsInCategory(PASS_MENU_TAG, restaurant);

    // Sort items by for_date before pushing to flattened
    const sortedItemIds = [...itemIds].sort((a, b) => {
      const aDate =
        (ItemUtils.getMenuItemFromItemId(a, restaurant) as PassItem).for_date ||
        "";
      const bDate =
        (ItemUtils.getMenuItemFromItemId(b, restaurant) as PassItem).for_date ||
        "";
      return aDate.localeCompare(bDate);
    });

    flattened.push(...sortedItemIds);

    return flattened;
  }, [restaurant, cart]);

  if (flatAccessCards.length > 0) {
    return (
      <div>
        {/* Scrollable Access Cards Container */}
        {!displayCartPasses && (
          <h1 className="text-xl font-bold">
            Live Passes at {restaurant.name}
          </h1>
        )}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-5 px-7 gap-4"
          onScroll={handleScroll}
        >
          {flatAccessCards.map((x, index) => {
            if (displayCartPasses) {
              let modifiedFlair = null;
              if (dealEffect) {
                if (x) {
                  modifiedFlair = modifiedItemFlair(x, restaurant, dealEffect);
                }
              }
              return (
                <div key={index} className="snap-center shrink-0 w-full">
                  <AccessCard
                    cart={cart}
                    cartItem={x as CartItem | null}
                    restaurant={restaurant}
                    itemId={null}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    modifiedFlair={modifiedFlair}
                    inlineRecommendation={inlineRecommendation}
                  />
                </div>
              );
            } else {
              return (
                <div key={index} className="snap-center shrink-0 w-full">
                  <AccessCard
                    cart={cart}
                    cartItemId={null}
                    restaurant={restaurant}
                    itemId={x as string}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    modifiedFlair={null}
                  />
                </div>
              );
            }
          })}
        </div>
        {/* Scroll Indicator Dots */}
        <div className="flex justify-center">
          {flatAccessCards.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                activeIndex === index ? "w-4" : "bg-gray-300 w-2"
              }`}
              style={{
                backgroundColor:
                  activeIndex === index
                    ? (restaurant.metadata.primaryColor as string)
                    : undefined,
              }}
            ></button>
          ))}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default AccessCardSlider;
