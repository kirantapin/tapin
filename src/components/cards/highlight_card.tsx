import React, { useEffect, useState } from "react";
import { BundleItem, NormalItem, PassItem, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { adjustColor } from "@/utils/color";
import { useRestaurant } from "@/context/restaurant_context";
import { BundleUtils } from "@/utils/bundle_utils";
import { BUNDLE_IMAGE_BUCKET } from "@/constants";
import { rest } from "lodash";

interface HighlightCardProps {
  content_type: "item" | "policy" | "bundle";
  content_pointer: string;
  title_override: string;
  description_override: string;
  image_url_override: string;
  restaurant: Restaurant;
  onClick?: () => void;
}

const HighlightCard: React.FC<HighlightCardProps> = ({
  content_type,
  content_pointer,
  title_override,
  description_override,
  image_url_override,
  restaurant,
  onClick,
}) => {
  const primaryColor = restaurant?.metadata.primaryColor as string;
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { policyManager } = useRestaurant();

  const setPolicyInfo = async () => {
    const policy = policyManager?.getPolicyFromId(content_pointer);
    setTitle(policy?.name);
    setDescription(policy?.header);
    setImageUrl(
      `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
    );
  };
  const setBundleInfo = async () => {
    const bundle = ItemUtils.getMenuItemFromItemId(
      content_pointer,
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
        content_pointer,
        restaurant
      ) as NormalItem | PassItem;
      // if (!item) {
      //   return null;
      // }
      setTitle(`Grab a ${item?.name} for $${item?.price}`);
      if (ItemUtils.isPassItem(content_pointer, restaurant)) {
        setDescription("Limited amount remaining. Grab while supplies last.");
      } else {
        setDescription(
          (item as NormalItem).description ||
            "Currently in stock. Purchase while supplies last."
        );
        setImageUrl((item as NormalItem).image_url || null);
      }
    }
    if (content_type === "policy") {
      setPolicyInfo();
    }
    if (content_type === "bundle") {
      setBundleInfo();
    }
  }, []);
  return (
    <div
      key={content_pointer}
      className="snap-center flex-shrink-0 w-full max-w-md h-32 rounded-3xl overflow-hidden flex items-stretch mr-4 enhance-contrast"
      style={{
        backgroundColor: restaurant?.metadata.primaryColor as string,
        color: "white",
      }}
    >
      {/* Left: Text Content */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="text-lg font-bold line-clamp-1">
            {titleCase(title_override || title || "")}
          </h3>

          <p className="text-xs line-clamp-2 overflow-hidden">
            {sentenceCase(description_override) || description || ""}
          </p>
        </div>

        <button
          className="bg-white px-5 py-1 rounded-full text-sm self-start font-bold"
          style={{ color: primaryColor }}
          onClick={onClick}
        >
          {content_type === "item"
            ? "Add to Cart"
            : content_type === "bundle"
            ? "View Bundle"
            : "View Deal"}
        </button>
      </div>

      {imageUrl && (
        <div className="flex-shrink-0 p-3 bg-gray-200 h-full w-32">
          <img
            src={image_url_override || imageUrl || ""}
            alt="name"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default HighlightCard;
