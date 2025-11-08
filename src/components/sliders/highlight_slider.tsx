import { useState, useRef, useEffect } from "react";
import { BundleItem, Highlight } from "@/types";
import HighlightCard from "../cards/highlight_card";
import { ItemUtils } from "@/utils/item_utils";
import { NORMAL_DEAL_TAG } from "@/constants";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { HighlightCardSkeleton } from "../skeletons/highlight_card_skeleton";
const HighlightSlider = ({ displayOne = false }: { displayOne?: boolean }) => {
  const { addToCart } = useBottomSheet();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePromo, setActivePromo] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { openBundleModal, handlePolicyClick } = useBottomSheet();
  const { restaurant, policyManager, userOwnershipMap, highlights } =
    useRestaurant();
  const { triggerToast } = useBottomSheet();
  const [clickLoading, setClickLoading] = useState(false);
  const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([]);
  useEffect(() => {
    if (!displayOne) {
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
    }
  }, [displayOne]);

  const handleUserInteraction = () => {
    if (!displayOne && autoScrollEnabled) {
      setAutoScrollEnabled(false);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!displayOne) {
      const scrollPosition = e.currentTarget.scrollLeft;
      const itemWidth = e.currentTarget.offsetWidth;
      const newActivePromo = Math.round(scrollPosition / itemWidth);
      setActivePromo(newActivePromo);
    }
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current || displayOne) return;

    const cardWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (
      displayOne ||
      !autoScrollEnabled ||
      highlights === null ||
      highlights.length <= 1
    )
      return;

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
  }, [highlights, autoScrollEnabled, displayOne]);

  useEffect(() => {
    const filterHighlights = async () => {
      if (!restaurant || !policyManager || highlights === null) return;
      const filteredHighlights = highlights.filter((highlight) => {
        if (highlight.content_type === "item") {
          if (!highlight.content_pointer) return false;
          return !ItemUtils.isItemUnavailable(
            { id: highlight.content_pointer },
            restaurant
          );
        } else if (highlight.content_type === "policy") {
          if (!highlight.content_pointer) return false;
          const policy = policyManager.getPolicyFromId(
            highlight.content_pointer
          );
          return (
            policy?.definition?.tag === NORMAL_DEAL_TAG &&
            PolicyUtils.isPolicyUsable(policy, restaurant)
          );
        } else if (highlight.content_type === "bundle") {
          if (!highlight.content_pointer) return false;
          return !ItemUtils.isItemUnavailable(
            { id: highlight.content_pointer },
            restaurant
          );
        } else if (highlight.content_type === "media") {
          const { title_override, description_override } = highlight;
          return title_override && description_override;
        }
        return false;
      });
      if (displayOne && filteredHighlights.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * filteredHighlights.length
        );
        setFilteredHighlights([filteredHighlights[randomIndex]]);
      } else {
        setFilteredHighlights(filteredHighlights);
      }
    };
    filterHighlights();
  }, [restaurant, displayOne, policyManager, highlights]);

  const handleHighlightClick = async (highlight: Highlight) => {
    if (!restaurant) return;
    setClickLoading(true);
    const content_pointer = highlight.content_pointer;
    if (!content_pointer) return;
    if (highlight.content_type === "item") {
      await addToCart({ id: content_pointer }, true);
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
    setClickLoading(false);
  };

  if (highlights === null || !restaurant || !policyManager) {
    return (
      <div className="mt-3">
        <HighlightCardSkeleton />
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto ${
          !displayOne ? "snap-x snap-mandatory" : ""
        } no-scrollbar scrollbar-hide -mx-5 px-5`}
        onScroll={handleScroll}
        onWheel={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <div className="flex gap-4">
          {filteredHighlights.map((h, idx) => (
            <div
              key={idx}
              className={`${!displayOne ? "snap-center" : ""} shrink-0 w-full`}
            >
              <HighlightCard
                highlight={h}
                restaurant={restaurant}
                onClick={() => {
                  handleHighlightClick(h);
                }}
                loading={clickLoading}
              />
            </div>
          ))}
          {!displayOne && <div className="shrink-0 w-10" />}
        </div>
      </div>

      {!displayOne && (
        <div className="flex justify-center mt-4">
          {filteredHighlights.map((_, index) => (
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
      )}
    </div>
  );
};

export default HighlightSlider;
