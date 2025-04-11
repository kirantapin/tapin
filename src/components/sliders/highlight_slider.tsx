import { useState, useRef, useEffect, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { Highlight, Policy, Restaurant } from "@/types";
import { modifiedItemFlair } from "@/utils/pricer";
import { fetch_highlights } from "@/utils/queries/highlights";
import HighlightCard from "../cards/highlight_card";
import { adjustColor } from "@/utils/color";
import { ItemUtils } from "@/utils/item_utils";
import { NORMAL_DEAL_TAG } from "@/constants";

const HighlightSlider = ({
  restaurant,
  addToCart,
  setPolicyModal,
  policies,
}: {
  restaurant: Restaurant;
  addToCart: (item_id: string) => void;
  setPolicyModal: (policy_id: string) => void;
  policies: Policy[];
}) => {
  const scrollContainerRef = useRef(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  // Function to update active card based on scroll position
  const [activePromo, setActivePromo] = useState(0);

  const handleScroll = (e) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const itemWidth = e.currentTarget.offsetWidth;
    const newActivePromo = Math.round(scrollPosition / itemWidth);
    setActivePromo(newActivePromo);
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

  useEffect(() => {
    const fetchHighlights = async () => {
      const highlights = await fetch_highlights(restaurant.id);
      console.log(highlights);
      const filteredHighlights = highlights.filter((highlight) => {
        if (highlight.content_type === "item") {
          const menuItem = ItemUtils.getMenuItemFromItemId(
            highlight.content_pointer,
            restaurant
          );
          return menuItem?.price != null;
        } else if (highlight.content_type === "policy") {
          const policy = policies.find(
            (p) => p.policy_id === highlight.content_pointer
          );
          return policy?.definition?.tag === NORMAL_DEAL_TAG;
        }
        return false;
      });
      setHighlights(filteredHighlights);
    };
    fetchHighlights();
  }, []);

  const handleHighlightClick = (highlight: Highlight) => {
    if (highlight.content_type === "item") {
      addToCart(highlight.content_pointer);
    } else {
      setPolicyModal(highlight.content_pointer);
    }
  };

  return (
    // <div className="mt-8">
    //   <div
    //     ref={scrollContainerRef}
    //     className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
    //     onScroll={handleScroll}
    //   >
    //     {highlights.map((highlight, index) => {
    //       return (
    //         <div key={index} className="snap-center shrink-0 w-full px-4">
    //           <HighlightCard
    //             content_type={highlight.content_type}
    //             content_pointer={highlight.content_pointer}
    //             title_override={highlight.title_override}
    //             description_override={highlight.description_override}
    //             image_url_override={highlight.image_url_override}
    //             restaurant={restaurant}
    //           />
    //         </div>
    //       );
    //     })}
    //   </div>

    //   {/* Scroll Indicator Dots */}
    //   <div className="flex justify-center">
    //     {highlights.map((highlight, index) => (
    //       <button
    //         key={index}
    //         onClick={() => scrollToCard(index)}
    //         className={`h-2 w-2 mx-1 rounded-full transition-colors duration-300 ${
    //           activeIndex === index ? "" : "bg-gray-300"
    //         }`}
    //         style={{
    //           backgroundColor:
    //             activeIndex === index
    //               ? restaurant.metadata.primaryColor
    //               : undefined,
    //         }}
    //       ></button>
    //     ))}
    //   </div>
    // </div>
    <div className="mt-7">
      <div
        className="overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-hide"
        onScroll={handleScroll}
      >
        <div className="flex snap-x snap-mandatory pl-1 pr-1">
          {highlights.map((highlight, index) => (
            <HighlightCard
              content_type={highlight.content_type}
              content_pointer={highlight.content_pointer}
              title_override={highlight.title_override}
              description_override={highlight.description_override}
              image_url_override={highlight.image_url_override}
              restaurant={restaurant}
              onClick={() => {
                handleHighlightClick(highlight);
              }}
            />
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {highlights.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              activePromo === index ? "w-4" : "w-2"
            }`}
            style={{
              backgroundColor:
                activePromo === index
                  ? restaurant?.metadata.primaryColor
                  : "#E5E7EB",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HighlightSlider;
