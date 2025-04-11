import { ADD_ON_TAG, NORMAL_DEAL_TAG } from "@/constants";
import { fetch_policies } from "./queries/policies";
import { supabase } from "./supabase_client";
import { Cart, DealEffectPayload, Policy, Restaurant } from "@/types";
import { getMissingItemsForPolicy } from "./item_recommender";
import { ItemUtils } from "./item_utils";

export class PolicyManager {
  private restaurant: Restaurant;
  private policies: Policy[];

  constructor(restaurant: Restaurant) {
    this.restaurant = restaurant;
    this.policies = [];
  }

  async init() {
    await this.fetchPolicies(this.restaurant.id);
  }

  async fetchPolicies(restaurantId: string): Promise<Policy[]> {
    const policies = await fetch_policies(restaurantId);
    this.policies = policies;
    return policies;
  }

  getDeals(): Policy[] {
    return this.policies.filter(
      (policy) => policy.definition.tag === NORMAL_DEAL_TAG
    );
  }

  getRecommendedDeals(cart: Cart, dealEffect: DealEffectPayload): Policy[] {
    const activePolicies = this.getActivePolicies(dealEffect, this.restaurant);
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
          this.restaurant,
          dealEffect
        ),
      }))
      .sort((a, b) => {
        const sumA = a.missingItems.reduce(
          (sum, item) => sum + item.quantityNeeded,
          0
        );
        const sumB = b.missingItems.reduce(
          (sum, item) => sum + item.quantityNeeded,
          0
        );
        return sumA - sumB;
      })
      .map(({ deal }) => deal);
    return sortedDeals;
  }

  getAddOns(
    cart: Cart,
    dealEffect: DealEffectPayload
  ): {
    allAddOns: Policy[];
    passAddOns: Policy[];
    normalAddOns: Policy[];
  } {
    console.log(this.policies);
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
        getMissingItemsForPolicy(policy, cart, this.restaurant, dealEffect)
          .length === 0
      ) {
        seenItems.add(actionItem);
        validPolicies.push(policy);
        const item = policy.definition.action.items[0];
        if (ItemUtils.isPassItem(item, this.restaurant)) {
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

  getAllPolicies(): Policy[] {
    return this.policies;
  }

  public getActivePolicies(
    dealeffect: DealEffectPayload,
    restaurant: Restaurant
  ): Policy[] {
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
}
