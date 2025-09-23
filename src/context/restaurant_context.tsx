import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BundleItem, Highlight, Restaurant, Transaction, Pass } from "@/types";
import { PolicyManager } from "@/utils/policy_manager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth_context";
import { BUNDLE_MENU_TAG, NOT_FOUND_PATH, PASS_MENU_TAG } from "@/constants";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { BundleUtils } from "@/utils/bundle_utils";
import { fetch_highlights } from "@/utils/queries/highlights";
import { supabase } from "@/utils/supabase_client";
import { ItemUtils } from "@/utils/item_utils";
type RestaurantContextType = {
  restaurant: Restaurant | null;
  setCurrentRestaurantId: (id: string | null) => void;
  setRestaurant: (restaurant: Restaurant | null) => void;
  policyManager: PolicyManager | null;
  userOwnershipMap: Record<string, string | null>;
  highlights: Highlight[] | null;
};

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  setCurrentRestaurantId: () => {},
  setRestaurant: () => {},
  policyManager: null,
  userOwnershipMap: {},
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

  const fetchUserPreviousPasses = async (restaurantData: Restaurant) => {
    if (!restaurantData || !transactions.length) return;

    // Get user's pass transactions for this restaurant
    const userPassTransactions = transactions.filter(
      (transaction: Transaction) =>
        transaction.restaurant_id === restaurantData.id &&
        transaction.metadata?.path?.includes(PASS_MENU_TAG)
    );
    if (userPassTransactions.length === 0) return;

    // Extract unique pass item IDs from user transactions
    const userPassItemIds = [
      ...new Set(userPassTransactions.map((t) => t.item)),
    ];

    // Check which passes are already in the restaurant object BEFORE querying
    const existingPassItemIds = new Set(
      ItemUtils.getAllItemsInCategory(PASS_MENU_TAG, restaurantData)
    );

    // Find passes that user has but aren't in restaurant object
    const missingPassItemIds = userPassItemIds.filter(
      (itemId) => !existingPassItemIds.has(itemId)
    );

    if (missingPassItemIds.length === 0) return;

    try {
      // Fetch historical passes for missing items only (look back 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const formattedDate = ninetyDaysAgo.toISOString();

      const { data: historicalPasses, error } = await supabase
        .from("passes")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .in("pass_id", missingPassItemIds)
        .gte("end_time", formattedDate)
        .returns<Pass[]>();

      if (error) {
        console.error("Error fetching historical passes:", error);
        return;
      }

      if (!historicalPasses || historicalPasses.length === 0) return;

      // Use functional state update to prevent race conditions
      setRestaurant((prevRestaurant) => {
        if (!prevRestaurant) return prevRestaurant;

        // Double-check that passes still aren't there (in case of race conditions)
        const currentExistingPassItemIds = new Set(
          prevRestaurant.menu[PASS_MENU_TAG]?.children || []
        );

        const stillMissingPassItemIds = missingPassItemIds.filter(
          (passId) => !currentExistingPassItemIds.has(passId)
        );

        if (stillMissingPassItemIds.length === 0) return prevRestaurant;

        // Filter historical passes to only include still missing ones
        const passesToAdd = historicalPasses.filter((pass) =>
          stillMissingPassItemIds.includes(pass.pass_id)
        );

        if (passesToAdd.length === 0) return prevRestaurant;

        // Add historical passes to restaurant menu
        const updatedMenu = {
          ...prevRestaurant.menu,
        };

        for (const pass of passesToAdd) {
          if (updatedMenu[pass.itemId]) {
            updatedMenu[pass.pass_id] = {
              path: [PASS_MENU_TAG, pass.itemId, pass.pass_id],
              children: [],
              info: {
                name: updatedMenu[pass.itemId].info.name,
                price: pass.price,
                description: pass.item_description,
                for_date: pass.for_date,
                end_time: pass.end_time,
                amount_remaining: pass.amount_remaining,
              },
            };
            if (!updatedMenu[pass.itemId].children.includes(pass.pass_id)) {
              updatedMenu[pass.itemId].children.push(pass.pass_id);
            }
          }
        }

        return {
          ...prevRestaurant,
          menu: updatedMenu,
        };
      });
    } catch (error) {
      console.error("Error in fetchUserPasses:", error);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchUserOwnership(restaurant);
    }
  }, [userSession, restaurant, transactions]);

  useEffect(() => {
    if (restaurant && transactions.length > 0) {
      fetchUserPreviousPasses(restaurant);
    }
  }, [restaurant, transactions]);

  const resetState = () => {
    setRestaurant(null);
    setPolicyManager(null);
    setUserOwnershipMap({});
    setHighlights(null);
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
        highlights,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
