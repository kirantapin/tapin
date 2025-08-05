import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ItemUtils } from "@/utils/item_utils";
import type { Restaurant, BundleItem } from "@/types";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";
import { PolicyManager } from "@/utils/policy_manager";

const UTM_PARAMS = ["bundle", "welcome", "policy"];

interface UseUTMParamsOptions {
  restaurant: Restaurant | null;
  openBundleModal: (bundle: BundleItem["object"]) => void;
  triggerToast: (
    msg: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => void;
}

export const useUTMParams = ({
  restaurant,
  openBundleModal,
  triggerToast,
}: UseUTMParamsOptions) => {
  const location = useLocation();
  const { handlePolicyClick } = useBottomSheet();
  const { policyManager } = useRestaurant();
  const [utmParams, setUtmParams] = useState<{ [key: string]: string }>({});

  const handleUTMParams = (
    search: string,
    restaurant: Restaurant,
    policyManager: PolicyManager
  ) => {
    const searchParams = new URLSearchParams(search);
    const utms: { [key: string]: string } = {};

    UTM_PARAMS.forEach((key) => {
      if (searchParams.has(key)) {
        utms[key] = searchParams.get(key) ?? "";
      }
    });

    setUtmParams(utms);

    if ("welcome" in utms) {
      triggerToast(
        `Welcome to ${restaurant?.name} on Tap In. Earn points, unlock exclusive deals & bundles, and skip the line—all in one spot.`,
        "info",
        3000
      );
    }

    if (utms.bundle) {
      const bundle = ItemUtils.getMenuItemFromItemId(
        utms.bundle,
        restaurant
      ) as BundleItem | null;

      if (bundle) {
        openBundleModal(bundle.object);
      } else {
        triggerToast(
          "The Bundle you're looking for could not be found",
          "error",
          3000
        );
      }
    }

    if (utms.policy) {
      const policy = policyManager.getPolicyFromId(utms.policy);

      if (policy) {
        handlePolicyClick(policy, {});
      } else {
        triggerToast(
          "The Offer you're looking for could not be found",
          "error",
          3000
        );
      }
    }
  };
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (
      location.search &&
      restaurant &&
      policyManager &&
      !hasHandledRef.current
    ) {
      hasHandledRef.current = true;
      handleUTMParams(location.search, restaurant, policyManager);
    }
  }, [location.search, restaurant, policyManager]);

  return utmParams;
};
