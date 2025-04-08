import { ADD_ON_TAG, NORMAL_DEAL_TAG } from "@/constants";
import { fetch_policies } from "./queries/policies";
import { supabase } from "./supabase_client";
import { Cart, Policy } from "@/types";
import { getMissingItemsForPolicy } from "./item_recommender";
import { isPassItem } from "./parse";

export class PolicyManager {
  private restaurantId: string;
  private policies: Policy[];

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
    this.policies = [];
  }

  async init() {
    await this.fetchPolicies(this.restaurantId);
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

  getAddOns(cart: Cart): {
    allAddOns: Policy[];
    passAddOns: Policy[];
    normalAddOns: Policy[];
  } {
    const validPolicies: Policy[] = [];
    const seenItems = new Set<string>();

    for (let i = 0; i < this.policies.length; i++) {
      const policy = this.policies[i];
      if (policy.definition.tag !== ADD_ON_TAG) continue;

      const actionItem = JSON.stringify(policy.definition.action.items[0]);
      if (seenItems.has(actionItem)) continue;

      if (getMissingItemsForPolicy(policy, cart).length === 0) {
        seenItems.add(actionItem);
        validPolicies.push(policy);
      }
    }
    const passAddOns: Policy[] = [];
    const normalAddOns: Policy[] = [];

    for (const policy of validPolicies) {
      const item = policy.definition.action.items[0];
      if (isPassItem(item)) {
        passAddOns.push(policy);
      } else {
        normalAddOns.push(policy);
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
}
