import { useState, useRef, useEffect } from "react";
import { BundleItem, Highlight, Policy } from "@/types";
import { fetch_highlights } from "@/utils/queries/highlights";
import HighlightCard from "../cards/highlight_card";
import { ItemUtils } from "@/utils/item_utils";
import { NORMAL_DEAL_TAG } from "@/constants";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
const HighlightSlider = ({
  addToCart,
  policies,
}: {
  addToCart: (item_id: string) => void;
  policies: Policy[];
}) => {
  const scrollContainerRef = useRef(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activePromo, setActivePromo] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { openBundleModal, handlePolicyClick } = useBottomSheet();
  const { restaurant, policyManager, userOwnershipMap } = useRestaurant();
  const { triggerToast } = useBottomSheet();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setAutoScrollEnabled(true);
        }
      },
      { threshold: 0 }
    );

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => {
      if (scrollContainerRef.current) {
        observer.unobserve(scrollContainerRef.current);
      }
    };
  }, []);

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
        } else if (highlight.content_type === "bundle") {
          const bundle = ItemUtils.getMenuItemFromItemId(
            highlight.content_pointer,
            restaurant
          );
          return bundle?.price && bundle.object.deactivated_at === null;
        }
        return false;
      });
      setHighlights(filteredHighlights);
    };
    fetchHighlights();
  }, [restaurant]);

  if (!restaurant || !policyManager) return null;

  const handleHighlightClick = (highlight: Highlight) => {
    if (highlight.content_type === "item") {
      addToCart(highlight.content_pointer);
    } else if (highlight.content_type === "bundle") {
      const bundle = ItemUtils.getMenuItemFromItemId(
        highlight.content_pointer,
        restaurant
      ) as BundleItem;
      openBundleModal(bundle.object);
    } else if (highlight.content_type === "policy") {
      const policy = policyManager.getPolicyFromId(highlight.content_pointer);
      if (policy) {
        handlePolicyClick(policy, userOwnershipMap);
      } else {
        triggerToast("This offering no longer exists", "error");
      }
    }
  };

  if (highlights.length > 0) {
    return (
      <div className="mt-3">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide -mx-4 px-4"
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
            <div className="shrink-0 w-10" />
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

export default HighlightSlider;
