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
  const [activePromo, setActivePromo] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserInteraction = () => {
    if (autoScrollEnabled) {
      setAutoScrollEnabled(false);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const itemWidth = e.currentTarget.offsetWidth;
    const newActivePromo = Math.round(scrollPosition / itemWidth);
    setActivePromo(newActivePromo);
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;

    const cardWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!autoScrollEnabled || highlights.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        setActivePromo((current) => {
          const nextIndex = current === highlights.length - 1 ? 0 : current + 1;
          scrollToCard(nextIndex);
          return nextIndex;
        });
      }, 3500);
    };

    startAutoScroll();

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [highlights.length, autoScrollEnabled]);

  useEffect(() => {
    const fetchHighlights = async () => {
      const highlights = await fetch_highlights(restaurant.id);
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
  }, [restaurant]);

  const handleHighlightClick = (highlight: Highlight) => {
    if (highlight.content_type === "item") {
      addToCart(highlight.content_pointer);
    } else {
      setPolicyModal(highlight.content_pointer);
    }
  };

  if (highlights.length > 0) {
    return (
      <div className="mt-5">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide"
          onScroll={handleScroll}
          onWheel={() => {
            handleUserInteraction();
          }}
          onTouchStart={() => {
            handleUserInteraction();
          }}
        >
          <div className="flex gap-4">
            {highlights.map((h, idx) => (
              <div key={idx} className="snap-center shrink-0 w-full">
                <HighlightCard
                  content_type={h.content_type}
                  content_pointer={h.content_pointer}
                  title_override={h.title_override}
                  description_override={h.description_override}
                  image_url_override={h.image_url_override}
                  restaurant={restaurant}
                  onClick={() => {
                    handleHighlightClick(h);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          {highlights.map((_, index) => (
            <button
              key={index}
              className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                activePromo === index ? "w-4" : "bg-gray-300 w-2"
              }`}
              style={{
                backgroundColor:
                  activePromo === index
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

export default HighlightSlider;
