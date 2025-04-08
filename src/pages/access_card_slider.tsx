import { useState, useRef, useEffect, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { Cart, CartItem, DealEffectPayload, Restaurant } from "@/types";
import { PASS_MENU_TAG } from "@/constants";
import { modifiedItemFlair } from "@/utils/pricer";

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
  addToCart;
  removeFromCart;
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
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };
  // if (dealEffect) {
  //   const { oldPrice, currentPrice, discountDescription } = modifiedItemFlair(
  //     item,
  //     restaurant,
  //     dealEffect
  //   );
  // }

  const flatAccessCards = useMemo(() => {
    const flattened = [];

    if (displayCartPasses) {
      for (const cartItem of cart) {
        const item = cartItem.item;
        if (item.path[0] === PASS_MENU_TAG) {
          flattened.push({
            name: item.path[1],
            date: item.path[2],
            itemInfo: {
              ...restaurant.menu[PASS_MENU_TAG][item.path[1]][item.path[2]],
              for_date: item.path[1],
            },
          });
        }
      }
      return flattened;
    }

    for (const [name, dateObjects] of Object.entries(
      restaurant.menu[PASS_MENU_TAG]
    )) {
      for (const [date, itemInfo] of Object.entries(dateObjects)) {
        flattened.push({
          name,
          date,
          itemInfo: { ...itemInfo, for_date: date },
        });
      }
    }

    return flattened;
  }, [restaurant, cart]);

  return (
    <div className="mt-8">
      {/* Scrollable Access Cards Container */}
      {!displayCartPasses && (
        <h1 className="text-xl font-bold">Live Passes at {restaurant.name}</h1>
      )}
      {flatAccessCards.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
          onScroll={handleScroll}
        >
          {flatAccessCards.map(({ name, date, itemInfo }, index) => {
            return (
              <div key={index} className="snap-center shrink-0 w-full px-4">
                <AccessCard
                  cart={cart}
                  primaryColor={restaurant.metadata.primaryColor}
                  venueName={restaurant?.name}
                  title={name}
                  regularPrice={itemInfo.price}
                  date={date}
                  itemPath={[PASS_MENU_TAG, name, date]}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              </div>
            );
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
        {flatAccessCards.map(({ name, date, itemInfo }, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`h-2 w-2 mx-1 rounded-full transition-colors duration-300 ${
              activeIndex === index ? "" : "bg-gray-300"
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
};

export default AccessCardSlider;
