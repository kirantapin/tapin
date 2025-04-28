import { useState, useRef, useEffect, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { Cart, CartItem, DealEffectPayload, Item, Restaurant } from "@/types";
import { MENU_DISPLAY_MAP, PASS_LABEL } from "@/constants";
import { modifiedItemFlair } from "@/utils/pricer";
import { ItemUtils } from "@/utils/item_utils";

const AccessCardSlider = ({
  cart,
  restaurant,
  addToCart,
  removeFromCart,
  displayCartPasses = false,
  dealEffect,
}: {
  cart: Cart;
  restaurant: Restaurant;
  addToCart: (item: Item) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  displayCartPasses: boolean;
  dealEffect: DealEffectPayload | null;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Function to update active card based on scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const cardWidth = scrollContainerRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  // Scroll to a specific card when clicking a dot
  const scrollToCard = (index) => {
    console.log("scrollToCard", index);
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

    const items = ItemUtils.getAllItemsInCategory(
      MENU_DISPLAY_MAP[PASS_LABEL],
      restaurant
    );

    flattened.push(...items);

    return flattened;
  }, [restaurant, cart]);

  if (flatAccessCards.length > 0) {
    return (
      <div className="mt-8">
        {/* Scrollable Access Cards Container */}
        {!displayCartPasses && (
          <h1 className="text-xl font-bold">
            Live Passes at {restaurant.name}
          </h1>
        )}
        {flatAccessCards.length > 0 ? (
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            onScroll={handleScroll}
          >
            {flatAccessCards.map((x, index) => {
              if (displayCartPasses) {
                let modifiedFlair = null;
                if (dealEffect) {
                  if (x) {
                    modifiedFlair = modifiedItemFlair(
                      x,
                      restaurant,
                      dealEffect
                    );
                  }
                }
                return (
                  <div key={index} className="snap-center shrink-0 w-full px-4">
                    <AccessCard
                      cart={cart}
                      cartItem={x as CartItem | null}
                      restaurant={restaurant}
                      itemId={null}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                      modifiedFlair={modifiedFlair}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={index} className="snap-center shrink-0 w-full px-4">
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
        ) : (
          !displayCartPasses && (
            <div className="flex justify-center mt-4">
              <h2>No Live Passes at this time</h2>
            </div>
          )
        )}
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
                    ? restaurant.metadata.primaryColor
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
