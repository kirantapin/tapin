import React, { useEffect, useState } from "react";
import { BundleItem, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { adjustColor } from "@/utils/color";
import { useRestaurant } from "@/context/restaurant_context";
import { BundleUtils } from "@/utils/bundle_utils";

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
      const item = ItemUtils.getMenuItemFromItemId(content_pointer, restaurant);
      // if (!item) {
      //   return null;
      // }
      setTitle(`Grab a ${item?.name} for $${item?.price}`);
      setDescription(
        item?.description || "Currently in stock. Purchase while supplies last."
      );
      setImageUrl(item?.image_url);
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
      className="snap-center flex-shrink-0 w-full max-w-md rounded-3xl overflow-hidden flex text-white mr-4 enhance-contrast"
      style={{
        background: restaurant?.metadata.primaryColor
          ? `linear-gradient(45deg, 
              ${adjustColor(primaryColor as string, -30)},
              ${adjustColor(primaryColor as string, 40)}
            )`
          : undefined,
      }}
    >
      {/* Left: Text Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title always shows */}
        <h3 className="text-lg font-bold mb-1 line-clamp-1">
          {titleCase(title_override || title || "")}
        </h3>

        {/* Description takes remaining space, but doesn't push content down */}
        <p className="text-xs flex-1 overflow-hidden line-clamp-2">
          {sentenceCase(description_override) || description || ""}
        </p>

        {/* Button always at bottom */}
        <button
          className="bg-white px-5 py-1 rounded-full mt-2 text-sm self-start font-bold"
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

      {/* Right: Image determines card height */}
      {imageUrl && (
        <div className="h-32 w-32 flex-shrink-0 p-3">
          <img
            src={image_url_override || imageUrl || ""}
            alt="name"
            className="h-full w-full object-cover rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default HighlightCard;
