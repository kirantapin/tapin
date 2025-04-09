import { OFFERS_PAGE_PATH, SINGLE_POLICY_PAGE_PATH } from "@/constants";
import { Policy, Restaurant } from "@/types";
import { Tag, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  return (
    <div className="flex items-center justify-between py-3 border-b mb-3">
      <div className="flex items-center gap-2">
        <Tag size={20} className="text-gray-800" />
        <span className="text-gray-800 text-sm font-medium">Active Deals</span>
      </div>
      <div
        className="flex items-center gap-1"
        onClick={() => {
          if (policy) {
            navigate(
              SINGLE_POLICY_PAGE_PATH.replace(":id", restaurant.id).replace(
                ":policy_id",
                policy.policy_id
              ),
              {
                state: {
                  previousPage: location.pathname,
                },
              }
            );
          } else {
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id));
          }
        }}
      >
        <span className="text-gray-800 text-md font-medium">
          {policy ? titleCase(policy.name) : "Checkout Exclusive Deals"}
        </span>
        <ChevronRight size={16} className="text-gray-800" />
      </div>
    </div>
  );
}
