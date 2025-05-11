import { BundleItem, Policy } from "@/types";

import { Bundle, Restaurant } from "@/types";

import { BUNDLE_MENU_TAG } from "@/constants";

import { supabase } from "./supabase_client";
import { PolicyUtils } from "./policy_utils";

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
          Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days
        ).toISOString()}`
      );

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
    const policyMap = policies.reduce((acc: Record<string, string[]>, curr) => {
      if (!acc[curr.bundle_id]) {
        acc[curr.bundle_id] = [];
      }
      acc[curr.bundle_id].push(curr.policy_id);
      return acc;
    }, {});

    return relevantBundles.map((bundle) => ({
      bundle,
      bundlePolicies: policyMap[bundle.bundle_id] || [],
    }));
  };
  static doesUserOwnBundle = async (
    user_id: string | null,
    bundle: Bundle
  ): Promise<boolean> => {
    if (!user_id) return false;
    const duration = bundle.duration;
    const { data, error } = await supabase
      .from("bundle_user")
      .select("*")
      .eq("user_id", user_id)
      .eq("bundle_id", bundle.bundle_id)
      .gte(
        "purchased_at",
        new Date(Date.now() - duration * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error || data.length === 0) {
      return false;
    }

    return data.length > 0;
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
}
