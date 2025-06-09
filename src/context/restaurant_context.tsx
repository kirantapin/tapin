import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BundleItem, Restaurant } from "@/types";
import { PolicyManager } from "@/utils/policy_manager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth_context";
import { BUNDLE_MENU_TAG, NOT_FOUND_PATH } from "@/constants";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { BundleUtils } from "@/utils/bundle_utils";
type RestaurantContextType = {
  restaurant: Restaurant | null;
  setCurrentRestaurantId: (id: string | null) => void;
  setRestaurant: (restaurant: Restaurant | null) => void;
  policyManager: PolicyManager | null;
  userOwnershipMap: Record<string, string | null>;
  fetchUserOwnership: (restaurant: Restaurant) => void;
};

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  setCurrentRestaurantId: () => {},
  setRestaurant: () => {},
  policyManager: null,
  userOwnershipMap: {},
  fetchUserOwnership: () => {},
});

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const lastFetchedRestaurantId = useRef<string | null>(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(
    null
  );
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [policyManager, setPolicyManager] = useState<PolicyManager | null>(
    null
  );

  const [userOwnershipMap, setUserOwnershipMap] = useState<
    Record<string, string | null>
  >({});
  const navigate = useNavigate();

  const { userSession } = useAuth();

  const fetchUserOwnership = async (restaurantData: Restaurant) => {
    const activeBundles = restaurantData.menu[BUNDLE_MENU_TAG].children;
    const userOwnershipMap: Record<string, string | null> = {};

    const ownershipPromises = activeBundles.map((bundleId: string) => {
      const bundle = (restaurantData.menu[bundleId].info as BundleItem).object;
      return BundleUtils.doesUserOwnBundle(userSession?.user?.id, bundle).then(
        (ownership) => ({ bundleId, ownership })
      );
    });

    const ownershipResults = await Promise.all(ownershipPromises);
    ownershipResults.forEach(
      ({
        bundleId,
        ownership,
      }: {
        bundleId: string;
        ownership: string | null;
      }) => {
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

  const resetState = () => {
    setRestaurant(null);
    setPolicyManager(null);
    setUserOwnershipMap({});
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentRestaurantId) return;
      if (restaurant?.id === currentRestaurantId) return;
      if (lastFetchedRestaurantId.current === currentRestaurantId) return;

      lastFetchedRestaurantId.current = currentRestaurantId;

      resetState();

      const restaurantData = await fetchRestaurantById(currentRestaurantId);
      if (!restaurantData) {
        navigate(NOT_FOUND_PATH);
        return;
      }
      setRestaurant(restaurantData);

      const policyManager = new PolicyManager(currentRestaurantId);
      await policyManager.init();
      setPolicyManager(policyManager);
    };

    fetchData();
  }, [currentRestaurantId, userSession]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        setRestaurant,
        setCurrentRestaurantId,
        policyManager,
        userOwnershipMap,
        fetchUserOwnership,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
