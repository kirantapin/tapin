import React, { useEffect, useState } from "react";
import {
  BundleItem,
  Highlight,
  NormalItem,
  PassItem,
  Restaurant,
} from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { useRestaurant } from "@/context/restaurant_context";
import { HIGHLIGHT_IMAGE_BUCKET } from "@/constants";
import { PolicyUtils } from "@/utils/policy_utils";
import { ImageUtils } from "@/utils/image_utils";
import { ImageFallback } from "../display_utils/image_fallback";

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
    image_url_override,
  } = highlight;
  const primaryColor = restaurant?.metadata.primaryColor as string;
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [defaultImageUrl, setDefaultImageUrl] = useState<string | null>(null);
  const { policyManager } = useRestaurant();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  const setPolicyInfo = async () => {
    const policy = policyManager?.getPolicyFromId(content_pointer || "");
    if (!policy) return;
    setTitle(PolicyUtils.getPolicyName(policy, restaurant));
    setDescription(policy?.header);
    setDefaultImageUrl(ImageUtils.getProfileImageUrl(restaurant) || "");
  };
  const setBundleInfo = async () => {
    const bundle = ItemUtils.getMenuItemFromItemId(
      content_pointer || "",
      restaurant
    ) as BundleItem;
    setTitle(bundle?.name);
    setDescription(
      `Receive amazing value at ${restaurant.name} with the ${bundle?.name}, exclusive on Tap In`
    );
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
      setDefaultImageUrl(ImageUtils.getProfileImageUrl(restaurant) || "");
    }
  }, []);

  useEffect(() => {
    if (!image_url_override) return;
    const img = new Image();
    img.src = ImageUtils.getHighlightImageUrl(highlight) || "";
    img.onload = () => setBgLoaded(true);
  }, [image_url_override]);

  if (dontShow) return null;

  return (
    <div
      key={content_pointer}
      className="snap-center flex-shrink-0 w-full max-w-md h-32 rounded-3xl overflow-hidden flex items-stretch mr-4 enhance-contrast relative"
      style={{
        ...(!image_url_override && {
          backgroundColor: primaryColor,
        }),
        color: "white",
      }}
      onClick={onClick}
    >
      {image_url_override && (
        <div className="absolute inset-0">
          {!bgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
              bgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `linear-gradient(155deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 60%), url(${ImageUtils.getHighlightImageUrl(
                highlight
              )})`,
            }}
          />
        </div>
      )}
      {/* Left: Text Content */}
      <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
        <div>
          <h3
            className={`text-lg font-bold ${
              content_pointer ? "line-clamp-1" : "line-clamp-2"
            }`}
            style={{ width: image_url_override ? "70%" : "100%" }}
          >
            {titleCase(title_override || title || "")}
          </h3>

          <p
            className={`text-xs  overflow-hidden ${
              content_pointer ? "line-clamp-2" : "line-clamp-4"
            }`}
            style={{ width: image_url_override ? "60%" : "100%" }}
          >
            {sentenceCase(description_override || description || "")}
          </p>
        </div>

        {content_pointer && (
          <button
            className="bg-white px-5 py-1 rounded-full text-sm self-start font-bold min-w-[100px] min-h-[30px] flex justify-center items-center"
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

      {defaultImageUrl && !image_url_override && (
        <div className="flex-shrink-0 p-3 bg-gray-200 h-full w-32">
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
