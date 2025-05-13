import { useState, useRef, useEffect, useMemo } from "react";
import AccessCard from "@/components/cards/access_card.tsx";
import { Bundle, Restaurant } from "@/types";

import BundleCard from "../cards/bundle_card";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
const BundleSlider = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { restaurant, userOwnershipMap } = useRestaurant();
  const { openBundleModal } = useBottomSheet();
  const [activeBundle, setActiveBundle] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    const newActiveBundle = Math.round(scrollPosition / itemWidth);
    setActiveBundle(newActiveBundle);
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
    if (
      !autoScrollEnabled ||
      Object.values(userOwnershipMap).filter((isOwned) => !isOwned).length <= 1
    )
      return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        setActiveBundle((current) => {
          const nextIndex =
            current === Object.keys(userOwnershipMap).length - 1
              ? 0
              : current + 1;
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
  }, [userOwnershipMap, autoScrollEnabled]);

  const bundlesToDisplay = Object.entries(userOwnershipMap)
    .filter(([bundleId, isOwned]) => {
      // Check if user doesn't own the bundle
      if (isOwned) return false;

      // Get the bundle object and check deactivated_at is null
      const bundle = restaurant?.menu[bundleId]?.info?.object;
      return bundle && bundle.deactivated_at === null;
    })
    .map(([bundleId]) => bundleId);

  if (userOwnershipMap && bundlesToDisplay.length > 0) {
    return (
      <div className="-mx-4">
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
            {bundlesToDisplay.map((bundleId, index) => (
              <div key={bundleId} className="snap-center shrink-0 w-full">
                <BundleCard
                  restaurant={restaurant as Restaurant}
                  bundleId={bundleId}
                  isOwned={userOwnershipMap[bundleId]}
                  onCardClick={openBundleModal}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-2">
          {bundlesToDisplay.map((bundleId, index) => {
            return (
              <button
                key={bundleId}
                className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                  activeBundle === index ? "w-4" : "bg-gray-300 w-2"
                }`}
                style={{
                  backgroundColor:
                    activeBundle === index
                      ? restaurant?.metadata.primaryColor
                      : undefined,
                }}
              ></button>
            );
          })}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default BundleSlider;
