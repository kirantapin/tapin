import { BundleItem, CartResultsPayload, Policy, Transaction } from "@/types";

import { Bundle, Restaurant } from "@/types";

import { BUNDLE_MENU_TAG, MAX_BUNDLE_DURATION } from "@/constants";

import { supabase } from "./supabase_client";
import { PolicyUtils } from "./policy_utils";
import { ItemUtils } from "./item_utils";

export class BundleUtils {
  static fetchBundles = async (
    restaurantId: string | null
  ): Promise<{ bundle: Bundle; bundlePolicies: string[] }[]> => {
    if (!restaurantId) return [];
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .or(
        `deactivated_at.is.null,deactivated_at.gt.${new Date(
          Date.now() - MAX_BUNDLE_DURATION * 24 * 60 * 60 * 1000
        ).toISOString()}`
      )
      .returns<Bundle[]>();

    if (error) {
      console.error("Error fetching bundles:", error);
      return [];
    }

    // Filter out bundles that have been deactivated for longer than their duration
    const relevantBundles = data.filter((bundle) => {
      if (!bundle.deactivated_at) return true;
      const deactivatedDate = new Date(bundle.deactivated_at);
      const durationInMs = bundle.duration * 24 * 60 * 60 * 1000;
      const cutoffDate = new Date(Date.now() - durationInMs);
      return deactivatedDate > cutoffDate;
    });
    // Get all bundle policy junctions for the bundle IDs
    const bundleIds = relevantBundles.map((bundle) => bundle.bundle_id);

    const { data: policies = [], error: policiesError } =
      bundleIds.length > 0
        ? await supabase
            .from("bundle_policy_junction")
            .select("bundle_id, policy_id")
            .in("bundle_id", bundleIds)
        : { data: [], error: null };

    // Group policies by bundle_id
    const policyMap = (policies ?? []).reduce(
      (acc: Record<string, string[]>, curr) => {
        if (!acc[curr.bundle_id]) {
          acc[curr.bundle_id] = [];
        }
        acc[curr.bundle_id].push(curr.policy_id);
        return acc;
      },
      {}
    );

    return relevantBundles.map((bundle) => ({
      bundle,
      bundlePolicies: policyMap[bundle.bundle_id] || [],
    }));
  };
  static doesUserOwnBundle = (
    transactions: Transaction[],
    user_id: string | null,
    bundle: Bundle
  ): string | null => {
    if (!user_id) return null;
    const duration = bundle.duration;
    const earliestDate = new Date(
      Date.now() - duration * 24 * 60 * 60 * 1000
    ).toISOString();

    const bundleTransactions = transactions.filter(
      (transaction) =>
        transaction.created_at >= earliestDate &&
        transaction.item === bundle.bundle_id
    );

    if (bundleTransactions.length === 0) {
      return null;
    }

    // Sort transactions by created_at in descending order and return the latest timestamp
    return bundleTransactions.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0].created_at;
  };
  static getUsersBundleUsageStats = async (
    user_id: string,
    bundle: Bundle
  ): Promise<Record<string, string[]>> => {
    if (!user_id) return {};
    const duration = bundle.duration;
    const { data, error } = await supabase
      .from("order_policy_junction")
      .select("policy_id, timestamp")
      .eq("user_id", user_id)
      .eq("bundle_id", bundle.bundle_id)
      .gte(
        "timestamp",
        new Date(Date.now() - duration * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) {
      console.error("Error fetching used policies:", error);
      return {};
    }

    const policyTimestampMap = data.reduce(
      (acc: Record<string, string[]>, curr) => {
        if (!acc[curr.policy_id]) {
          acc[curr.policy_id] = [];
        }
        acc[curr.policy_id].push(curr.timestamp);
        acc[curr.policy_id].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );
        return acc;
      },
      {}
    );

    return policyTimestampMap;
  };
  static getBundleIdFromChildPolicyId = (
    childPolicyId: string,
    restaurant: Restaurant
  ) => {
    const allBundleIds = restaurant.menu[BUNDLE_MENU_TAG].children;
    const validBundleIds = allBundleIds.filter((bundleId) => {
      const bundleItem = restaurant.menu[bundleId].info as BundleItem;
      return bundleItem.bundle_policies?.includes(childPolicyId);
    });
    return validBundleIds;
  };
  static estimateBundleValue = (
    bundle: Bundle,
    restaurant: Restaurant,
    childPolicies: Policy[]
  ) => {
    const bundlePolicyValue = childPolicies.reduce((totalValue, policy) => {
      if (!policy) return totalValue;

      const estimatedPolicyValue = PolicyUtils.getEstimatedPolicyValue(
        policy,
        restaurant
      );

      if (policy.total_usages) {
        return totalValue + estimatedPolicyValue * policy.total_usages;
      }

      // If no total_usage, estimate based on duration
      const daysInBundle = bundle.duration;
      const daysSinceLastUse = policy.days_since_last_use || daysInBundle;

      const estimatedUses = Math.floor(daysInBundle / daysSinceLastUse);
      return totalValue + estimatedPolicyValue * estimatedUses;
    }, 0);
    return bundlePolicyValue + bundle.fixed_credit;
  };

  static separateBundlePoliciesByType = (
    policies: Policy[]
  ): {
    deals: Policy[];
    freeItems: Policy[];
  } => {
    const deals: Policy[] = [];
    const freeItems: Policy[] = [];

    for (const policy of policies) {
      const { conditions, action } = policy.definition;
      if (conditions.length === 0 && action.type === "add_item") {
        freeItems.push(policy);
      } else {
        deals.push(policy);
      }
    }
    return {
      deals,
      freeItems,
    };
  };

  static isBundlePurchaseable = (bundle: Bundle) => {
    if (bundle.deactivated_at === null) {
      return true;
    }
    if (new Date(bundle.deactivated_at) > new Date()) {
      return true;
    }
    return false;
  };

  static suggestBundle = (
    restaurant: Restaurant,
    userOwnershipMap: Record<string, string | null>,
    cartResults: CartResultsPayload
  ): Bundle | null => {
    if (!cartResults) return null;
    let bestBundle = null;
    let smallestDifference = Infinity;
    const totalPrice = cartResults.totalPrice;

    for (const bundleId of Object.keys(userOwnershipMap)) {
      if (!userOwnershipMap[bundleId]) {
        const bundle = ItemUtils.getMenuItemFromItemId(
          bundleId,
          restaurant
        ) as BundleItem;
        const credit = bundle.object.fixed_credit;
        const difference = Math.abs(credit - totalPrice);
        if (difference < smallestDifference) {
          smallestDifference = difference;
          bestBundle = bundle.object;
        }
      }
    }
    return bestBundle;
  };
}
