import { Search, ChevronLeft, ShoppingBag, Plus, Moon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { act, useEffect, useState } from "react";
import {
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
  RESTAURANT_PATH,
  SINGLE_POLICY_PAGE_PATH,
} from "@/constants";
import { Policy, Restaurant } from "@/types";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { fetch_policies } from "@/utils/queries/policies";
import { project_url } from "@/utils/supabase_client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getPolicyFlair } from "@/utils/parse";
import DealCard from "@/components/cards/small_policy";
import { useCartManager } from "@/hooks/useCartManager";
import { useAuth } from "@/context/auth_context";
import PolicyModal from "@/components/bottom_sheets/policy_modal";

export default function PoliciesPage() {
  const { userSession } = useAuth();
  const location = useLocation();
  const [activeTag, setActiveTag] = useState(
    location.state?.tag || NORMAL_DEAL_TAG
  );
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicies, setActivePolicies] = useState<Policy[]>([]);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
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
      setShowSkeleton(false);
    };
    fetchData();
  }, []);

  const tagMap = {
    Deals: NORMAL_DEAL_TAG,
    Rewards: LOYALTY_REWARD_TAG,
  };

  useEffect(() => {
    setShowSkeleton(true);
    const filtered = policies.filter(
      (policy) => policy.definition.tag === activeTag
    );
    setActivePolicies(filtered);
    setShowSkeleton(false);
  }, [activeTag, policies]);
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold">Awesome Deals</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-4 mt-6 mb-8">
        {Object.keys(tagMap).map((tagLabel) => (
          <button
            key={tagMap[tagLabel]}
            className={`px-6 py-2 rounded-full border  text-sm whitespace-nowrap ${
              activeTag === tagMap[tagLabel] ? "" : " text-gray-500"
            }`}
            style={
              activeTag === tagMap[tagLabel]
                ? {
                    color: restaurant?.metadata.primaryColor,
                    borderColor: restaurant?.metadata.primaryColor,
                    backgroundColor: `${restaurant?.metadata.primaryColor}33`,
                  }
                : {}
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
      <div className="px-12 space-y-8 flex flex-col items-center w-full">
        {/* Show Skeletons if `showSkeleton` is true */}
        {showSkeleton ? (
          [...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden border-gray-200 rounded-2xl"
            >
              <CardHeader className="p-0">
                <div className="relative mt-3 mx-3">
                  <Skeleton width="100%" height={192} className="rounded-2xl" />
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-1">
                <div className="flex justify-between items-start">
                  <Skeleton width="60%" height={20} />
                  <Skeleton width={32} height={32} className="rounded-full" />
                </div>
                <Skeleton width="80%" height={14} className="mt-2" />
              </CardContent>

              <CardFooter className="py-2">
                <div>
                  <Skeleton width={100} height={12} />
                  <Skeleton
                    width={80}
                    height={16}
                    className="mt-1 rounded-full"
                  />
                </div>
              </CardFooter>
            </Card>
          ))
        ) : activePolicies.length > 0 ? (
          activePolicies.map((policy) => (
            // <Card
            //   key={policy.policy_id} // Added key to prevent React warnings
            //   className="overflow-hidden border-gray-200 rounded-2xl"
            //   onClick={() => {
            //     navigate(
            //       SINGLE_POLICY_PAGE_PATH.replace(":id", restaurant_id).replace(
            //         ":policy_id",
            //         policy.policy_id
            //       ),
            //       {
            //         state: {
            //           previousPage: location.pathname,
            //         },
            //       }
            //     );
            //   }}
            // >
            //   <CardHeader className="p-0">
            //     <div className="relative mt-3 mx-3">
            //       <img
            //         src={
            //           policy.image_url ||
            //           `${project_url}/storage/v1/object/public/restaurant_images/${policy.restaurant_id}_profile.png`
            //         }
            //         alt="TapIn Logo"
            //         className="w-full h-48 object-cover rounded-2xl"
            //         onError={(e) => {
            //           e.currentTarget.src = ""; // Should be replaced with a generic TapIn logo in the public directory
            //         }}
            //       />
            //       <div className="absolute bottom-2 left-2 bg-black/80 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center font-semibold">
            //         <Moon className="w-3 h-3 mr-1" />
            //         {getPolicyFlair(policy)}
            //       </div>
            //     </div>
            //   </CardHeader>

            //   <CardContent className="pt-3 pb-1">
            //     <div className="flex justify-between items-start">
            //       <h3 className="text-lg font-bold">{policy.name}</h3>
            //       <button
            //         className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center ml-2 flex-shrink-0"
            //         style={{
            //           backgroundColor: restaurant?.metadata.primaryColor,
            //         }}
            //       >
            //         <Plus className="w-5 h-5" />
            //       </button>
            //     </div>
            //     <p className="text-gray-600 text-sm">{policy.header}</p>
            //   </CardContent>

            //   <CardFooter className="py-2">
            //     <div>
            //       <div className="text-gray-500 text-sm">
            //         {policy.begin_time && policy.end_time
            //           ? "8 PM – 12 AM • Unlimited"
            //           : "Anytime"}
            //       </div>
            //       <div className="mt-1">
            //         <span className="bg-gray-400 text-white text-xs px-3 py-1 rounded-full">
            //           Open to All
            //         </span>
            //       </div>
            //     </div>
            //     <button onClick={() => console.log(policy)}></button>
            //   </CardFooter>
            // </Card>
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
