import React, { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { fetchPolicyById } from "@/utils/queries/policies";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";
import { adjustColor } from "@/utils/color";

interface HighlightCardProps {
  content_type: "item" | "policy";
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

  const setPolicyInfo = async () => {
    const policy = await fetchPolicyById(content_pointer);
    setTitle(policy?.name);
    setDescription(policy?.header);
    setImageUrl(
      `${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`
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
  }, []);
  return (
    <div
      key={content_pointer}
      className="snap-center flex-shrink-0 w-full max-w-md rounded-3xl overflow-hidden p-0 flex text-white mr-4"
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
      <div className="flex flex-col justify-between flex-1 pt-4 pb-4 pl-4 pr-1 pr-0">
        <div>
          <h3 className="text-lg  overflow-hidden  custom-line-clamp-1 font-bold ">
            {titleCase(title_override || title || "")}
          </h3>
          <p className="text-sm overflow-hidden break-words custom-line-clamp">
            {sentenceCase(description_override || description || "")}
          </p>
        </div>
        <button
          className="bg-white px-5 py-1 rounded-full mt-2 text-sm self-start font-bold"
          style={{ color: primaryColor }}
          onClick={onClick}
        >
          {content_type === "item" ? "Add to Cart" : "View Deal"}
        </button>
      </div>

      {/* Right: Image Block with full height and right rounding */}
      {imageUrl && (
        <div className="h-full w-36 rounded-3xl overflow-hidden p-3">
          <img
            src={image_url_override || imageUrl || ""}
            alt="name"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default HighlightCard;
