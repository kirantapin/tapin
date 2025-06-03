import { useNavigate } from "react-router-dom";
import { Policy, Restaurant, Bundle } from "@/types";
import { NORMAL_DEAL_TAG, OFFERS_PAGE_PATH } from "@/constants";
import SmallPolicyCard from "../cards/small_policy_card.tsx";
import { PolicyUtils } from "@/utils/policy_utils.ts";

interface PolicySliderProps {
  restaurant: Restaurant | null;
  policies: Policy[];
  state: any;
  unlockedFirst?: boolean;
}

export const PolicySlider: React.FC<PolicySliderProps> = ({
  restaurant,
  policies,
  state,
  unlockedFirst = false,
}) => {
  const navigate = useNavigate();

  const dealPolicies = policies.filter(
    (policy) => policy.definition.tag === NORMAL_DEAL_TAG
  );

  if (unlockedFirst) {
    dealPolicies.sort((a, b) => {
      const aLocked = a.locked;
      const bLocked = b.locked;
      if (aLocked && !bLocked) return 1;
      if (!aLocked && bLocked) return -1;
      return 0;
    });
  }

  if (!restaurant || dealPolicies.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Awesome Deals</h1>
        <button
          className="text-md font-semibold"
          style={{ color: restaurant.metadata.primaryColor as string }}
          onClick={() => {
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id));
          }}
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
        <div className="flex gap-4">
          {dealPolicies.map((policy, index) => (
            <div className="flex-none w-full" key={index}>
              <SmallPolicyCard
                policy={policy}
                restaurant={restaurant}
                bottomTongueText={
                  PolicyUtils.isPolicyUsable(policy, restaurant)
                    ? null
                    : PolicyUtils.getUsageDescription(policy, restaurant)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
