import { supabase } from "../supabase_client";
import { Restaurant, Policy } from "../../types";

export const fetch_policies = async (
  restaurant_id: string | undefined
): Promise<Policy[]> => {
  if (!restaurant_id) {
    return [];
  }
  const currentTime = new Date().toISOString();

  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("restaurant_id", restaurant_id)
    .or(
      `and(begin_time.lte.${currentTime},end_time.gte.${currentTime}),and(begin_time.is.null,end_time.is.null)`
    );
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
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
