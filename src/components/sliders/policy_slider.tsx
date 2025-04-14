import { useNavigate } from "react-router-dom";
import DealCard from "@/components/cards/small_policy.tsx";
import { Policy, Restaurant } from "@/types";
import { NORMAL_DEAL_TAG, OFFERS_PAGE_PATH } from "@/constants";

interface PolicySliderProps {
  restaurant: Restaurant | null;
  policies: Policy[];
  state: any;
  setPolicy: (policy: Policy) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const PolicySlider: React.FC<PolicySliderProps> = ({
  restaurant,
  policies,
  state,
  setPolicy,
  setIsOpen,
}) => {
  const navigate = useNavigate();

  const dealPolicies = policies.filter(
    (policy) => policy.definition.tag === NORMAL_DEAL_TAG
  );

  if (!restaurant || dealPolicies.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Awesome Deals</h1>
        <button
          className="text-sm font-semibold"
          style={{ color: restaurant?.metadata["primaryColor"] }}
          onClick={() => {
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id));
          }}
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 whitespace-nowrap">
          {dealPolicies.map((policy, index) => (
            <DealCard
              key={index}
              cart={state.cart}
              policy={policy}
              restaurant={restaurant}
              primaryColor={restaurant?.metadata.primaryColor}
              setPolicy={setPolicy}
              setIsOpen={setIsOpen}
              dealEffect={state.dealEffect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
