import { supabase } from "../supabase_client";
import { Restaurant, Policy } from "../../types";

export const fetchPoliciesForBundle = async (
  bundle_id: string | undefined
): Promise<Policy[]> => {
  if (!bundle_id) {
    return [];
  }

  const {
    data: bundle_policy_junction_data,
    error: bundle_policy_junction_error,
  } = await supabase
    .from("bundle_policy_junction")
    .select("policy_id")
    .eq("bundle_id", bundle_id);

  if (bundle_policy_junction_error) {
    console.error(
      "Error fetching bundle policy junction:",
      bundle_policy_junction_error
    );
    return [];
  }

  const policy_ids = bundle_policy_junction_data.map(
    (junction) => junction.policy_id
  );

  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .in("policy_id", policy_ids);

  if (error) {
    console.error("Error fetching policies:", error);
    return [];
  }

  return data;
};

export const fetchPolicyById = async (
  policy_id: string | undefined
): Promise<Policy | null> => {
  if (!policy_id) {
    return null;
  }

  const currentTime = new Date().toISOString();

  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("policy_id", policy_id)
    .single(); // Ensures only one policy is returned

  if (error) {
    console.error("Error fetching policy:", error);
    return null;
  }

  return data;
};
