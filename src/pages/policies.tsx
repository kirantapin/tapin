import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
  RESTAURANT_PATH,
  SINGLE_POLICY_PAGE_PATH,
} from "@/constants";
import { Policy, Restaurant } from "@/types";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { fetch_policies } from "@/utils/queries/policies";

import DealCard from "@/components/cards/small_policy";
import { useCartManager } from "@/hooks/useCartManager";
import { useAuth } from "@/context/auth_context";
import PolicyModal from "@/components/bottom_sheets/policy_modal";
import Rewards from "@/components/rewards.tsx";
import { SignInButton } from "@/components/signin/signin_button";
import { setThemeColor } from "@/utils/color";
export default function PoliciesPage() {
  setThemeColor();
  const { userSession, userData } = useAuth();
  const location = useLocation();
  const [activeTag, setActiveTag] = useState(
    location.state?.tag || NORMAL_DEAL_TAG
  );
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicies, setActivePolicies] = useState<Policy[]>([]);
  const { id: restaurant_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const { state, addPolicy, addToCart, removeFromCart } = useCartManager(
    restaurant as Restaurant,
    userSession
  );

  useEffect(() => {
    //fetch policies by restaurant ID
    if (!restaurant_id) {
      navigate("/not_found_page");
    }
    const fetchData = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      const policies = await fetch_policies(restaurant_id);
      setPolicies(policies);
      setRestaurant(restaurant);
    };
    fetchData();
  }, []);

  const tagMap: Record<string, string> = {
    Deals: NORMAL_DEAL_TAG,
    Rewards: LOYALTY_REWARD_TAG,
  };

  useEffect(() => {
    if (activeTag === NORMAL_DEAL_TAG) {
      const filtered = policies.filter(
        (policy) => policy.definition.tag === activeTag
      );
      setActivePolicies(filtered);
    }
  }, [activeTag, policies]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">Exclusive Offers</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-4 mt-6 mb-8">
        {Object.keys(tagMap).map((tagLabel) => (
          <button
            key={tagMap[tagLabel]}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap border transition-all duration-150 font-medium ${
              activeTag === tagMap[tagLabel]
                ? "text-sm"
                : "text-sm text-gray-500"
            }`}
            style={
              activeTag === tagMap[tagLabel]
                ? {
                    color: restaurant?.metadata.primaryColor,
                    borderColor: restaurant?.metadata.primaryColor,
                  }
                : {
                    backgroundColor: "#f6f8fa",
                    borderColor: "#e5e7eb", // neutral border for inactive
                  }
            }
            onClick={() => {
              setActiveTag(tagMap[tagLabel]);
            }}
          >
            {tagLabel}
          </button>
        ))}
      </div>

      {/* Deals */}

      {activeTag === NORMAL_DEAL_TAG && (
        <div className="px-12 space-y-8 flex flex-col items-center w-full">
          {activePolicies.length > 0 ? (
            activePolicies.map((policy) => (
              <DealCard
                cart={state.cart}
                policy={policy}
                restaurant={restaurant as Restaurant}
                setPolicy={setActivePolicy}
                setIsOpen={setIsOpen}
                dealEffect={state.dealEffect}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No active policies available.
            </p>
          )}
        </div>
      )}

      {activeTag === LOYALTY_REWARD_TAG &&
        restaurant &&
        (userData ? (
          <div className="px-4">
            <Rewards
              viewAll={true}
              restaurant={restaurant as Restaurant}
              userData={userData}
              onIntentionToRedeem={(policy) => {
                setActivePolicy(policy);
                setIsOpen(true);
              }}
            />
          </div>
        ) : (
          <SignInButton onClose={() => {}} />
        ))}
      {activePolicy && (
        <PolicyModal
          policy={activePolicy}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          restaurant={restaurant as Restaurant}
          onAddToCart={addPolicy}
          state={state}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
}
