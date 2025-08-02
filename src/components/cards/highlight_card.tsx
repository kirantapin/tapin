import React, { useEffect, useState } from "react";
import {
  BundleItem,
  Highlight,
  NormalItem,
  PassItem,
  Restaurant,
} from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { useRestaurant } from "@/context/restaurant_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "../display_utils/image_fallback";
import { formatBundleName } from "@/utils/parse";
import { HighlightCardSkeleton } from "../skeletons/highlight_card_skeleton";

interface HighlightCardProps {
  highlight: Highlight;
  restaurant: Restaurant;
  onClick?: () => void;
  loading?: boolean;
}

const HighlightCard: React.FC<HighlightCardProps> = ({
  highlight,
  restaurant,
  onClick,
  loading,
}) => {
  const {
    content_type,
    content_pointer,
    title_override,
    description_override,
  } = highlight;
  const primaryColor = restaurant?.metadata.primaryColor;
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [defaultImageUrl, setDefaultImageUrl] = useState<string | null>(null);
  const { policyManager } = useRestaurant();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [hasHighlightImage, setHasHighlightImage] = useState(true);

  const setPolicyInfo = async () => {
    const policy = policyManager?.getPolicyFromId(content_pointer || "");
    if (!policy) return;
    setTitle(PolicyUtils.getPolicyName(policy, restaurant));
    setDescription(policy?.header);
    setDefaultImageUrl("fallback");
  };

  const setBundleInfo = async () => {
    const bundle = ItemUtils.getMenuItemFromItemId(
      content_pointer || "",
      restaurant
    ) as BundleItem;
    setTitle(formatBundleName(bundle?.name));
    setDescription(
      `Receive amazing value at ${restaurant.name} with the ${formatBundleName(
        bundle?.name
      )}, exclusive on Tap In`
    );
    setDefaultImageUrl("fallback");
  };

  useEffect(() => {
    if (content_type === "item") {
      const item = ItemUtils.getMenuItemFromItemId(
        content_pointer || "",
        restaurant
      ) as NormalItem | PassItem;
      if (!item) {
        setDontShow(true);
        return;
      }
      setTitle(`Grab a ${item?.name} for $${item?.price}`);
      if (ItemUtils.isPassItem(content_pointer || "", restaurant)) {
        setDescription("Limited amount remaining. Grab while supplies last.");
      } else {
        setDescription(
          (item as NormalItem).description ||
            "Currently in stock. Purchase while supplies last."
        );
        setDefaultImageUrl((item as NormalItem).image_url || null);
      }
    }
    if (content_type === "policy") {
      setPolicyInfo();
    }
    if (content_type === "bundle") {
      setBundleInfo();
    }
    if (content_type === "media") {
      setDefaultImageUrl("fallback");
    }
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = ImageUtils.getHighlightImageUrl(highlight) || "";
    img.onload = () => {
      setBgLoaded(true);
      setHasHighlightImage(true);
    };
    img.onerror = () => {
      setHasHighlightImage(false);
    };
  }, [highlight]);

  if (hasHighlightImage && !bgLoaded) {
    return <HighlightCardSkeleton />;
  }

  if (dontShow) return null;

  return (
    <div
      key={content_pointer}
      className="snap-center flex-shrink-0 w-full max-w-md h-32 rounded-3xl overflow-hidden flex items-stretch mr-4 enhance-contrast relative"
      style={{
        ...(!hasHighlightImage && {
          transition: "background-color 200ms ease-in-out",
        }),
        backgroundColor: primaryColor,
        color: "white",
        transition: "color 200ms ease-in-out",
      }}
      onClick={onClick}
    >
      {hasHighlightImage && (
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-200 opacity-100`}
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.5) 45%, rgba(0, 0, 0, 0) 75%), url(${ImageUtils.getHighlightImageUrl(
                highlight
              )})`,
            }}
          />
        </div>
      )}

      {/* Left: Text Content */}
      <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
        <div className="text-left">
          <h3
            className={`text-lg font-bold ${
              content_pointer ? "line-clamp-1" : "line-clamp-2"
            }`}
            style={{ width: hasHighlightImage ? "70%" : "100%" }}
          >
            {titleCase(title_override || title || "")}
          </h3>

          <p
            className={`text-xs overflow-hidden ${
              content_pointer ? "line-clamp-2" : "line-clamp-4"
            }`}
            style={{ width: hasHighlightImage ? "60%" : "100%" }}
          >
            {sentenceCase(description_override || description || "")}
          </p>
        </div>

        {content_pointer && (
          <button
            className="bg-white px-5 py-[2px] rounded-full text-sm self-start font-bold min-w-[100px] min-h-[30px] flex justify-center items-center"
            style={{ color: "black" }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : content_type === "item" ? (
              "Add to Cart"
            ) : content_type === "bundle" ? (
              "View Bundle"
            ) : content_type === "media" ? (
              "View"
            ) : (
              "View Deal"
            )}
          </button>
        )}
      </div>

      {defaultImageUrl && !hasHighlightImage && (
        <div className="flex-shrink-0 bg-gray-200 h-full w-32">
          <ImageFallback
            src={defaultImageUrl || ""}
            alt="name"
            className="w-full h-full object-contain"
            restaurant={restaurant}
          />
        </div>
      )}
    </div>
  );
};

export default HighlightCard;
