import React, { createContext, useContext, useEffect, useState } from "react";
import { Policy, Restaurant } from "@/types";
import { PolicyManager } from "@/utils/policy_manager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth_context";
import { BUNDLE_MENU_TAG } from "@/constants";
import { doesUserOwnBundle } from "@/utils/queries/bundles";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { BundleUtils } from "@/utils/bundle_utils";
type RestaurantContextType = {
  restaurant: Restaurant | null;
  loading: boolean;
  setCurrentRestaurantId: (id: string | null) => void;
  setRestaurant: (restaurant: Restaurant | null) => void;
  policyManager: PolicyManager | null;
  userOwnershipMap: Record<string, boolean>;
};

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  loading: true,
  setCurrentRestaurantId: () => {},
  setRestaurant: () => {},
  policyManager: null,
  userOwnershipMap: {},
});

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(
    null
  );
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [policyManager, setPolicyManager] = useState<PolicyManager | null>(
    null
  );

  const [userOwnershipMap, setUserOwnershipMap] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { userSession } = useAuth();

  const fetchUserOwnership = async (restaurantData: Restaurant) => {
    const activeBundles = restaurantData.menu[BUNDLE_MENU_TAG].children;
    const userOwnershipMap: Record<string, boolean> = {};

    const ownershipPromises = activeBundles.map((bundleId: string) => {
      const bundle = restaurantData.menu[bundleId].info.object;
      return BundleUtils.doesUserOwnBundle(userSession?.user?.id, bundle).then(
        (ownership) => ({ bundleId, ownership })
      );
    });

    const ownershipResults = await Promise.all(ownershipPromises);
    ownershipResults.forEach(
      ({ bundleId, ownership }: { bundleId: string; ownership: boolean }) => {
        userOwnershipMap[bundleId] = ownership;
      }
    );

    setUserOwnershipMap(userOwnershipMap);
  };

  useEffect(() => {
    if (restaurant) {
      fetchUserOwnership(restaurant);
    }
  }, [userSession, restaurant]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentRestaurantId) return;

      // Only fetch if it's a different restaurant
      if (restaurant?.id === currentRestaurantId) return;

      setLoading(true);
      fetchRestaurantById(currentRestaurantId).then((restaurantData) => {
        if (!restaurantData) {
          navigate("/not_found");
          return;
        }
        setRestaurant(restaurantData);
      });
      const policyManager = new PolicyManager(currentRestaurantId);
      policyManager.init().then(() => {
        setPolicyManager(policyManager);
      });

      setLoading(false);
    };

    fetchData();
  }, [currentRestaurantId, userSession]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        loading,
        setRestaurant,
        setCurrentRestaurantId,
        policyManager,
        userOwnershipMap,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
