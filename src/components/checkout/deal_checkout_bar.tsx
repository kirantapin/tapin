import { OFFERS_PAGE_PATH } from "@/constants";
import { Policy, Restaurant } from "@/types";
import { Tag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { titleCase } from "title-case";

type DealPreOrderBarProps = {
  policy: Policy | null;
  restaurant: Restaurant;
};

export default function DealPreOrderBar({
  policy,
  restaurant,
}: DealPreOrderBarProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Tag size={20} className="text-gray-800" />
        <span className="text-gray-800 text-md font-medium line-clamp-1 w-[100px]">
          Active Deals
        </span>
      </div>
      <div
        className="flex items-center gap-1"
        onClick={() => {
          navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id));
        }}
      >
        <span className="text-gray-800 text-md font-medium line-clamp-1">
          {policy ? titleCase(policy.name) : "Checkout Exclusive Deals"}
        </span>
        <ChevronRight size={16} className="text-gray-800" />
      </div>
    </div>
  );
}
