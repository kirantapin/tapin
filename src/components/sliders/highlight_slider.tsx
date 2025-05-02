import { useState, useRef, useEffect, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { BundleItem, Highlight, Policy, Restaurant } from "@/types";
import { modifiedItemFlair } from "@/utils/pricer";
import { fetch_highlights } from "@/utils/queries/highlights";
import HighlightCard from "../cards/highlight_card";
import { adjustColor } from "@/utils/color";
import { ItemUtils } from "@/utils/item_utils";
import { MY_SPOT_PATH, NORMAL_DEAL_TAG } from "@/constants";
import { BundleUtils } from "@/utils/bundle_utils";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth_context";
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
  const { openBundleModal, openPolicyModal, handlePolicyClick } =
    useBottomSheet();
  const { restaurant, policyManager, userOwnershipMap } = useRestaurant();
  const navigate = useNavigate();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("entry", entry);
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
        toast.error("This offering no longer exists");
      }
    }
  };

  if (highlights.length > 0) {
    return (
      <div className="mt-3">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide "
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
