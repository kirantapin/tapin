import { Policy, Bundle, Restaurant } from "@/types";
import { Share } from "lucide-react";

export const ShareButton = ({
  objectType,
  object,
  restaurant,
}: {
  objectType: "bundle" | "policy";
  object: Bundle | Policy;
  restaurant: Restaurant;
}) => {
  const createShareUrl = () => {
    if (objectType === "bundle") {
      return `${window.location.origin}/${restaurant.id}/?bundle=${
        (object as Bundle).bundle_id
      }`;
    } else if (objectType === "policy") {
      return `${window.location.origin}/${restaurant.id}/?policy=${
        (object as Policy).policy_id
      }`;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: `Here's something interesting at ${restaurant.name}!`,
          url: createShareUrl(),
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 text-white rounded-full shadow"
      style={{ backgroundColor: restaurant.metadata.primaryColor }}
    >
      <Share size={18} />
    </button>
  );
};
