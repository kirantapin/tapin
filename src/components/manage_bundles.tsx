import React, { useEffect, useState } from "react";
import { Restaurant, BundleItem } from "@/types";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { Clock } from "lucide-react";
import { BundleUtils } from "@/utils/bundle_utils";
import BundleSlider from "./sliders/bundle_slider";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import GoToCartButton from "./buttons/go_to_cart_button";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "./display_utils/image_fallback";
import { adjustColor } from "@/utils/color";

interface BundleCardBackgroundProps {
  bundleImageUrl: string | null;
  restaurant: Restaurant;
  bundleName: string;
}

const BundleCardBackground: React.FC<BundleCardBackgroundProps> = ({
  bundleImageUrl,
  restaurant,
  bundleName,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const primaryColor = restaurant?.metadata.primaryColor || "#8B0000";
  const fromColor = adjustColor(primaryColor, -5);
  const toColor = adjustColor(primaryColor, -45);

  useEffect(() => {
    if (!bundleImageUrl) {
      setImageError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
    img.src = bundleImageUrl;
  }, [bundleImageUrl]);

  const isUsingImage = !imageError && bundleImageUrl && imageLoaded;

  return (
    <>
      {imageError || !bundleImageUrl ? (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
          }}
        />
      ) : !imageLoaded ? (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : (
        <ImageFallback
          src={bundleImageUrl}
          restaurant={restaurant}
          alt={bundleName}
          className="w-full h-full object-cover"
          postFunction={() => setImageError(true)}
        />
      )}
      {/* Gradient Overlay - Only show if using image */}
      {isUsingImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)",
          }}
        />
      )}
    </>
  );
};

interface ManageBundlesProps {
  restaurant: Restaurant;
}

const ManageBundles: React.FC<ManageBundlesProps> = () => {
  const { restaurant, userOwnershipMap } = useRestaurant();
  const { state, openBundleModal } = useBottomSheet();

  if (!restaurant) {
    return null;
  }

  const bundlesToDisplay = Object.entries(userOwnershipMap)
    .filter(([bundleId, isOwned]) => {
      if (isOwned) return true;
      const bundle = (restaurant?.menu[bundleId]?.info as BundleItem)?.object;
      return bundle && BundleUtils.isBundlePurchaseable(bundle);
    })
    .map(([bundleId]) => bundleId);

  if (bundlesToDisplay.length === 0) {
    return (
      <div className="mt-8 px-4 flex justify-center">
        <h1 className="text-lg font-semibold">No Available Bundles</h1>
        <GoToCartButton
          restaurant={restaurant}
          cartCount={
            state.cart.reduce((total, item) => total + item.quantity, 0) || 0
          }
        />
      </div>
    );
  }

  return (
    <div className="px-2 mt-3">
      {Object.entries(userOwnershipMap).map(([bundleId, isOwned]) => {
        if (!isOwned) {
          return null;
        }

        const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
          bundleId,
          restaurant
        ) as BundleItem;
        if (!bundleMenuItem || bundleMenuItem.price == null) {
          return null;
        }

        const bundle = bundleMenuItem.object;
        const bundleImageUrl = ImageUtils.getBundleImageUrl(bundle);

        const purchaseDate = new Date(userOwnershipMap[bundleId] as string);
        const expiryDate = new Date(
          purchaseDate.getTime() + bundle.duration * 24 * 60 * 60 * 1000
        );
        const timeLeft = Math.max(0, expiryDate.getTime() - Date.now());
        const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
        const hoursLeft = Math.floor(
          (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        );
        const minutesLeft = Math.floor(
          (timeLeft % (60 * 60 * 1000)) / (60 * 1000)
        );

        // Format time remaining
        let timeRemainingString = "";
        if (daysLeft > 0) {
          timeRemainingString = `${daysLeft} ${
            daysLeft === 1 ? "day" : "days"
          } remaining`;
        } else {
          timeRemainingString = `${hoursLeft}h ${minutesLeft}m remaining`;
        }

        return (
          <div key={bundleId} className="mb-6">
            <div
              className="relative rounded-3xl overflow-hidden h-[220px] cursor-pointer"
              onClick={() => {
                openBundleModal(bundle);
              }}
            >
              {/* Background Image or Gradient */}
              <div className="absolute inset-0">
                <BundleCardBackground
                  bundleImageUrl={bundleImageUrl}
                  restaurant={restaurant}
                  bundleName={bundle.name}
                />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col p-5">
                {/* Top Row: Owned Tag and Points */}
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/60"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    Owned
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/60"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {bundle.point_multiplier > 1
                      ? `${bundle.point_multiplier}x`
                      : "1x"}{" "}
                    pts
                  </div>
                </div>

                {/* Bottom Section: Title, Time, and Button */}
                <div className="flex-1 flex flex-col justify-end mb-2">
                  {/* Bundle Title */}
                  <h2 className="text-2xl font-bold text-white custom-line-clamp">
                    {bundle.name}
                  </h2>

                  {/* Days Remaining */}
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={18} className="text-white" />
                    <span className="text-white text-sm font-medium">
                      {timeRemainingString}
                    </span>
                  </div>

                  {/* Start Redeeming Button */}
                  <button
                    className="w-full bg-white rounded-full py-2 px-4 mt-4 flex items-center justify-center font-semibold text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBundleModal(bundle);
                    }}
                  >
                    <span className="font-semibold">View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="pb-16">
        {Object.values(userOwnershipMap).some((value) => value === null) && (
          <div className="mt-6 px-1 mb-8">
            <h1 className="text-xl font-bold">Bundles You Might Like</h1>
            <BundleSlider showBundleExplainer={false} />
          </div>
        )}
      </div>
      <GoToCartButton
        restaurant={restaurant}
        cartCount={
          state.cart.reduce((total, item) => total + item.quantity, 0) || 0
        }
      />
    </div>
  );
};

export default ManageBundles;
