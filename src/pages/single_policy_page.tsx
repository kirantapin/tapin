import { Policy, Restaurant } from "@/types";
import { fetch_policies, fetchPolicyById } from "@/utils/queries/policies";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { project_url } from "@/utils/supabase_client";
import { ArrowLeft, ShoppingBag, Moon, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { titleCase } from "title-case";
import { convertUtcToLocal, sentenceCase } from "@/utils/parse";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { CartManager } from "@/utils/cartManager";
import { useAuth } from "@/context/auth_context";
import { RESTAURANT_PATH } from "@/constants";
import { toast, ToastContainer } from "react-toastify";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { resourceLimits } from "worker_threads";

export default function SinglePolicyPage() {
  const { userSession } = useAuth();
  const { id: restaurant_id, policy_id } = useParams<{
    id: string;
    policy_id: string;
  }>();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<Policy | null>();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const cartManager = useRef<CartManager | null>(null);
  const location = useLocation();
  const previousPage =
    location?.state?.previousPage ||
    RESTAURANT_PATH.replace(":id", restaurant_id);

  useEffect(() => {
    const setManager = async () => {
      if (!cartManager.current || !cartManager.current.userSession) {
        console.log("there", userSession);
        cartManager.current = new CartManager(restaurant_id, userSession);
        await cartManager.current.init();
      }
    };
    setManager();
  }, [userSession]);

  useEffect(() => {
    if (!restaurant_id || !policy_id) {
      navigate("/not_found_page");
    }
    const fetchData = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      const policy = await fetchPolicyById(policy_id);
      if (!restaurant || !policy) {
        navigate("/not_found_page");
      }
      setPolicy(policy);
      setRestaurant(restaurant);
    };
    fetchData();
  }, []);
  return restaurant && policy ? (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <button
          className="w-10 h-10 flex items-center justify-center bg-black/10 rounded-full"
          onClick={() => {
            console.log(previousPage);
            navigate(previousPage);
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex items-center">
          {restaurant.name}
        </h1>
        <button className="w-10 h-10 flex items-center justify-center bg-black/10 rounded-full">
          <ShoppingBag size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-4">
        {/* Image with Nightly Deal Tag positioned over it */}
        <div className="relative mb-4 mt-2">
          <img
            src={
              policy.image_url ||
              `${project_url}/storage/v1/object/public/restaurant_images/${policy.restaurant_id}_profile.png`
            }
            alt="TapIn Logo"
            className="w-full aspect-[2/1] object-cover rounded-2xl border-2 border-black"
            onError={(e) => {
              e.currentTarget.src = ""; // Replace with a generic image in your public directory
            }}
          />

          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-md">
            <Moon size={16} className="text-yellow-400" />
            <span className="font-medium text-sm">Nightly Deal Use</span>
          </div>
        </div>

        {/* Deal Info */}
        <div className="flex justify-between items-start mt-2">
          <h2 className="text-2xl font-bold">{titleCase(policy.name || "")}</h2>
        </div>

        <p className="text-gray-600 mt-3">
          {sentenceCase(policy.header || "")}
        </p>
        <div className="flex items-center mt-4 text-gray-500">
          <PolicyDescriptionDisplay policy={policy} />
        </div>

        <div className="flex items-center mt-4 text-gray-500">
          <div>
            {policy.begin_time && policy.end_time ? (
              <span>
                {convertUtcToLocal(policy.begin_time)} -{" "}
                {convertUtcToLocal(policy.end_time)}
              </span>
            ) : (
              "Anytime"
            )}

            {!policy.count_as_deal && (
              <div>
                <span className="mx-2">•</span>
                <span>Unlimited</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          {policy.subscription_id ? (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
              Subscription Needed
            </span>
          ) : (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
              Open to All
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {policy && (
          <button
            className="fixed bottom-4 left-4 right-4 text-white py-3 rounded-md flex items-center justify-center gap-2"
            style={{ backgroundColor: restaurant?.metadata.primaryColor }}
            onClick={async () => {
              if (cartManager.current) {
                const result = await cartManager.current.setPolicy(policy);
                if (result) {
                  toast(result, {
                    className: "bg-red-500 text-white",
                    progressClassName: "bg-red-700",
                  });
                } else {
                  toast("Deal added to cart.", {
                    className: "bg-green-500 text-white",
                    progressClassName: "bg-green-700",
                  });
                }
              } else {
                console.log("Try Again");
              }
            }}
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        )}
      </div>
      <ToastContainer />
    </div>
  ) : (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <Skeleton circle width={40} height={40} />
        <Skeleton width={150} height={24} />
        <Skeleton circle width={40} height={40} />
      </header>

      <div className="flex-1 overflow-auto px-4">
        {/* Image Skeleton */}
        <Skeleton width="100%" height={180} className="rounded-2xl" />

        {/* Title & Header Skeleton */}
        <div className="flex justify-between items-start mt-2">
          <Skeleton width={200} height={28} />
        </div>

        <Skeleton width="80%" height={20} className="mt-3" />
        <Skeleton width="60%" height={18} className="mt-1" />

        {/* Policy Description */}
        <div className="flex items-center mt-4 text-gray-500">
          <Skeleton width="90%" height={16} />
        </div>

        {/* Deal Time Skeleton */}
        <div className="flex items-center mt-4 text-gray-500">
          <Skeleton width="50%" height={16} />
        </div>

        {/* Subscription Tag Skeleton */}
        <div className="mt-2">
          <Skeleton width={120} height={24} />
        </div>

        {/* Add to Cart Button Skeleton */}
        <Skeleton width="100%" height={50} className="mt-4" />
      </div>
    </div>
  );
}
