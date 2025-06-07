import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ItemUtils } from "@/utils/item_utils";
import type { Restaurant, BundleItem } from "@/types";

const UTM_PARAMS = ["bundle"];

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
  const [utmParams, setUtmParams] = useState<{ [key: string]: string }>({});

  const handleUTMParams = (search: string) => {
    const searchParams = new URLSearchParams(search);
    const utms: { [key: string]: string } = {};

    UTM_PARAMS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) utms[key] = value;
    });

    setUtmParams(utms);

    if (utms.bundle && restaurant) {
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
  };

  useEffect(() => {
    if (location.search) {
      handleUTMParams(location.search);
    }
  }, [location.search, restaurant]);

  return utmParams;
};
