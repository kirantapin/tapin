import { useState, useRef, useEffect } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { Restaurant } from "@/types";
import { PASS_MENU_TAG } from "@/constants";

const AccessCardSlider = ({ restaurant }: { restaurant: Restaurant }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const accessCards = restaurant.menu[PASS_MENU_TAG];

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

  return (
    <div className="mt-8">
      {/* Scrollable Access Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        {Object.entries(accessCards).map(([name, price], index) => (
          <div key={index} className="snap-center shrink-0 w-full px-4">
            <AccessCard
              baseColor={restaurant.metadata.primaryColor}
              venueName={restaurant?.name}
              title={name}
              savings="Save $1.50 per drink"
              regularPrice={price}
              discountPrice={5}
              date="01/25"
            />
          </div>
        ))}
      </div>

      {/* Scroll Indicator Dots */}
      <div className="flex justify-center">
        {Object.entries(accessCards).map((_, index) => (
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
