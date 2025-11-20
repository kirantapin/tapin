import { useState, useRef, useEffect } from "react";
import { BundleItem, Restaurant } from "@/types";

import BundleCard from "../cards/bundle_card";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { BundleUtils } from "@/utils/bundle_utils";
import { AlertCircle } from "lucide-react";
const BundleSlider = ({
  fallbackDisplay = false,
  showBundleExplainer = true,
}: {
  fallbackDisplay?: boolean;
  showBundleExplainer?: boolean;
}) => {
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

  const bundlesToDisplay = Object.entries(userOwnershipMap)
    .filter(([bundleId, isOwned]) => {
      const bundle = (restaurant?.menu[bundleId]?.info as BundleItem).object;
      if (!bundle) return false;
      //only block it if bundle is deactivated and the user doesn't own it.
      if (!BundleUtils.isBundlePurchaseable(bundle) && !isOwned) return false;
      return true;
    })
    .sort((a, b) => {
      const [bundleIdA, isOwnedA] = a;
      const [bundleIdB, isOwnedB] = b;
      // First, unowned bundles come first
      if (isOwnedA && !isOwnedB) return 1;
      if (!isOwnedA && isOwnedB) return -1;

      // Secondary sort by modified_at desc within each group
      const bundleA = (restaurant?.menu[bundleIdA]?.info as BundleItem).object;
      const bundleB = (restaurant?.menu[bundleIdB]?.info as BundleItem).object;
      const modifiedAtA = new Date(bundleA.modified_at).getTime();
      const modifiedAtB = new Date(bundleB.modified_at).getTime();

      return modifiedAtB - modifiedAtA;
    })
    .map(([bundleId]) => bundleId);

  useEffect(() => {
    if (!autoScrollEnabled || bundlesToDisplay.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        setActiveBundle((current) => {
          const nextIndex = (current + 1) % bundlesToDisplay.length;
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
  }, [bundlesToDisplay, autoScrollEnabled]);

  if (userOwnershipMap && bundlesToDisplay.length > 0) {
    return (
      <div className="-mx-5">
        {showBundleExplainer && (
          <div className="bg-green-100 mt-4 mx-4 mb-1 px-4 py-3 rounded-xl border border-1 border-green-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-green-800 w-5 h-5" />
              <p className="text-green-800 text-md font-medium">
                Bundles unlock various exclusive deals
              </p>
            </div>
          </div>
        )}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto snap-x snap-mandatory no-scrollbar mt-4 mb-5"
          onScroll={handleScroll}
          onWheel={handleUserInteraction}
          onTouchStart={handleUserInteraction}
        >
          <div className="flex gap-4 px-4 -mx-5">
            <div className="w-[50vw] flex-shrink-0" />
            {bundlesToDisplay.map((bundleId) => (
              <div key={bundleId} className="snap-center flex-shrink-0">
                <BundleCard
                  restaurant={restaurant as Restaurant}
                  bundleId={bundleId}
                  isOwned={userOwnershipMap[bundleId]}
                  onCardClick={openBundleModal}
                />
              </div>
            ))}
            <div className="w-[50vw] flex-shrink-0" />
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
    if (fallbackDisplay) {
      return (
        <div className="mt-4 mb-4 flex justify-center items-center min-h-[200px]">
          <h1 className="text-lg font-semibold">
            No Bundles currently available
          </h1>
        </div>
      );
    } else {
      return null;
    }
  }
};

export default BundleSlider;
