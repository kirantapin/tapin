import { useState, useRef, useEffect } from "react";
import { BundleItem, Highlight, Policy } from "@/types";
import { fetch_highlights } from "@/utils/queries/highlights";
import HighlightCard from "../cards/highlight_card";
import { ItemUtils } from "@/utils/item_utils";
import { NORMAL_DEAL_TAG } from "@/constants";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { BundleUtils } from "@/utils/bundle_utils";

const HighlightSlider = ({
  addToCart,
  policies,
}: {
  addToCart: (item_id: string) => Promise<void>;
  policies: Policy[];
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activePromo, setActivePromo] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { openBundleModal, handlePolicyClick } = useBottomSheet();
  const { restaurant, policyManager, userOwnershipMap } = useRestaurant();
  const { triggerToast } = useBottomSheet();
  const [cardLoading, setCardLoading] = useState(false);
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
      if (!restaurant) return;
      const highlights = await fetch_highlights(restaurant.id);
      const filteredHighlights = highlights.filter((highlight) => {
        if (highlight.content_type === "item") {
          const menuItem = ItemUtils.getMenuItemFromItemId(
            highlight.content_pointer,
            restaurant
          );
          return menuItem && menuItem?.price;
        } else if (highlight.content_type === "policy") {
          const policy = policies.find(
            (p) => p.policy_id === highlight.content_pointer
          );
          return (
            policy?.definition?.tag === NORMAL_DEAL_TAG &&
            PolicyUtils.isPolicyUsable(policy, restaurant)
          );
        } else if (highlight.content_type === "bundle") {
          const bundle = ItemUtils.getMenuItemFromItemId(
            highlight.content_pointer,
            restaurant
          ) as BundleItem;
          return (
            bundle?.price && BundleUtils.isBundlePurchaseable(bundle.object)
          );
        } else if (highlight.content_type === "media") {
          const { title_override, description_override } = highlight;
          return title_override && description_override;
        }
        return false;
      });
      setHighlights(filteredHighlights);
    };
    fetchHighlights();
  }, [restaurant]);

  const handleHighlightClick = async (highlight: Highlight) => {
    setCardLoading(true);
    const content_pointer = highlight.content_pointer;
    if (!content_pointer) return;
    if (highlight.content_type === "item") {
      await addToCart(content_pointer);
    } else if (highlight.content_type === "bundle") {
      const bundle = ItemUtils.getMenuItemFromItemId(
        content_pointer,
        restaurant
      ) as BundleItem;
      openBundleModal(bundle.object);
    } else if (highlight.content_type === "policy") {
      const policy = policyManager?.getPolicyFromId(content_pointer);
      if (policy) {
        handlePolicyClick(policy, userOwnershipMap);
      } else {
        triggerToast("This offering no longer exists", "error");
      }
    } else if (highlight.content_type === "media") {
      const url = content_pointer.startsWith("http")
        ? content_pointer
        : `http://${content_pointer}`;
      window.open(url, "_blank");
    }
    setCardLoading(false);
  };

  if (highlights.length === 0 || !restaurant || !policyManager) {
    return null;
  }

  return (
    <div className="mt-3">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide -mx-5 px-5"
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
                highlight={h}
                restaurant={restaurant}
                onClick={() => {
                  handleHighlightClick(h);
                }}
                loading={cardLoading}
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
};

export default HighlightSlider;
