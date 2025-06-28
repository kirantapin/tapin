import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BundleItem, Highlight, Restaurant } from "@/types";
import { PolicyManager } from "@/utils/policy_manager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth_context";
import { BUNDLE_MENU_TAG, NOT_FOUND_PATH } from "@/constants";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { BundleUtils } from "@/utils/bundle_utils";
import { fetch_highlights } from "@/utils/queries/highlights";
type RestaurantContextType = {
  restaurant: Restaurant | null;
  setCurrentRestaurantId: (id: string | null) => void;
  setRestaurant: (restaurant: Restaurant | null) => void;
  policyManager: PolicyManager | null;
  userOwnershipMap: Record<string, string | null>;
  fetchUserOwnership: (restaurant: Restaurant) => void;
  highlights: Highlight[] | null;
};

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  setCurrentRestaurantId: () => {},
  setRestaurant: () => {},
  policyManager: null,
  userOwnershipMap: {},
  fetchUserOwnership: () => {},
  highlights: null,
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
  const [highlights, setHighlights] = useState<Highlight[] | null>(null);

  const [userOwnershipMap, setUserOwnershipMap] = useState<
    Record<string, string | null>
  >({});
  const navigate = useNavigate();

  const { userSession, transactions } = useAuth();

  const fetchUserOwnership = (restaurantData: Restaurant) => {
    const activeBundles = restaurantData.menu[BUNDLE_MENU_TAG].children;
    const userOwnershipMap: Record<string, string | null> = {};

    const ownershipResults = activeBundles.map((bundleId: string) => {
      const bundle = (restaurantData.menu[bundleId].info as BundleItem).object;
      const ownership = BundleUtils.doesUserOwnBundle(
        transactions,
        userSession?.user?.id || null,
        bundle
      );
      return { bundleId, ownership };
    });

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
  }, [userSession, restaurant, transactions]);

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

      const highlights = await fetch_highlights(restaurantData.id);
      setHighlights(highlights);
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
        highlights,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
