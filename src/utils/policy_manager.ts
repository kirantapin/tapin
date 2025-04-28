import { ADD_ON_TAG, BUNDLE_MENU_TAG, NORMAL_DEAL_TAG } from "@/constants";
import { Cart, DealEffectPayload, Policy, Restaurant } from "@/types";
import { getMissingItemsForPolicy } from "./item_recommender";
import { ItemUtils } from "./item_utils";
import { PolicyUtils } from "./policy_utils";
export class PolicyManager {
  public policies: Policy[];
  public restaurant_id: string;

  constructor(restaurant_id: string) {
    this.restaurant_id = restaurant_id;
    this.policies = [];
  }

  async init() {
    const policies = await PolicyUtils.fetchPoliciesByRestaurantId(
      this.restaurant_id
    );
    this.policies = policies;
  }

  getDeals(): Policy[] {
    return this.policies.filter(
      (policy) => policy.definition.tag === NORMAL_DEAL_TAG
    );
  }

  getRecommendedDeals(
    cart: Cart,
    dealEffect: DealEffectPayload,
    restaurant: Restaurant
  ): Policy[] {
    const activePolicies = this.getActivePolicies(dealEffect);
    const activeDeal = activePolicies.some(
      (policy) => policy.definition.tag === NORMAL_DEAL_TAG
    );
    if (activeDeal) {
      return [];
    }
    const deals = this.getDeals();
    const sortedDeals = deals
      .map((deal) => ({
        deal,
        missingItems: getMissingItemsForPolicy(
          deal,
          cart,
          restaurant,
          dealEffect
        ),
      }))
      .sort((a, b) => {
        let sumA = a.missingItems.reduce(
          (sum, item) => sum + item.quantityNeeded,
          0
        );
        let sumB = b.missingItems.reduce(
          (sum, item) => sum + item.quantityNeeded,
          0
        );
        if (sumA === 0) {
          sumA = 1000;
        }
        if (sumB === 0) {
          sumB = 1000;
        }
        return sumA - sumB;
      })
      .map(({ deal }) => deal);

    if (sortedDeals.length > 3) {
      return sortedDeals.slice(0, 3);
    }
    return sortedDeals;
  }

  getAddOns(
    cart: Cart,
    dealEffect: DealEffectPayload,
    restaurant: Restaurant
  ): {
    allAddOns: Policy[];
    passAddOns: Policy[];
    normalAddOns: Policy[];
  } {
    const validPolicies: Policy[] = [];
    const seenItems = new Set<string>();

    const passAddOns: Policy[] = [];
    const normalAddOns: Policy[] = [];

    for (let i = 0; i < this.policies.length; i++) {
      const policy = this.policies[i];
      if (policy.definition.tag !== ADD_ON_TAG) continue;

      const actionItem = JSON.stringify(policy.definition.action.items[0]);
      if (seenItems.has(actionItem)) continue;
      if (
        getMissingItemsForPolicy(policy, cart, restaurant, dealEffect)
          .length === 0
      ) {
        seenItems.add(actionItem);
        validPolicies.push(policy);
        const item = policy.definition.action.items[0];
        if (ItemUtils.isPassItem(item, restaurant)) {
          console.log("in here");
          passAddOns.push(policy);
        } else {
          normalAddOns.push(policy);
        }
      }
    }

    return {
      allAddOns: validPolicies,
      passAddOns,
      normalAddOns,
    };
  }

  getAllPolicies(restaurant: Restaurant): Policy[] {
    const unlockedPolicies = this.getUnlockedPolicies();
    const bundlePolicyIds = restaurant.menu[BUNDLE_MENU_TAG]
      .children as string[];
    const allPolicies = [...unlockedPolicies];
    bundlePolicyIds.forEach((bundlePolicyId) => {
      restaurant.menu[bundlePolicyId].info.bundle_policies.forEach(
        (policyId: string) => {
          const policy = this.getPolicyFromId(policyId);
          if (
            policy &&
            !allPolicies.some((p) => p.policy_id === policy.policy_id)
          ) {
            allPolicies.push(policy);
          }
        }
      );
    });
    return allPolicies;
  }

  getUnlockedPolicies(): Policy[] {
    return this.policies.filter((policy) => !policy.locked);
  }

  public getActivePolicies(dealeffect: DealEffectPayload): Policy[] {
    const activePolicyIds = PolicyManager.getActivePolicyIds(dealeffect);

    // Return policies that match the active IDs
    return this.policies.filter((policy) =>
      activePolicyIds.has(policy.policy_id)
    );
  }
  public static getActivePolicyIds(dealeffect: DealEffectPayload): Set<string> {
    const activePolicyIds = new Set<string>();

    // Get policy IDs from added items
    dealeffect.addedItems.forEach(({ policy_id }) => {
      activePolicyIds.add(policy_id);
    });

    // Get policy IDs from modified items
    dealeffect.modifiedItems.forEach(({ policy_id }) => {
      activePolicyIds.add(policy_id);
    });

    // Get policy ID from whole cart modification if it exists
    if (dealeffect.wholeCartModification) {
      activePolicyIds.add(dealeffect.wholeCartModification.policy_id);
    }

    // Return policies that match the active IDs
    return activePolicyIds;
  }

  public getPolicyFromId(policyId: string): Policy | null {
    const policy = this.policies.find(
      (policy) => policy.policy_id === policyId
    );
    if (!policy) {
      return null;
    }
    return policy;
  }
}
