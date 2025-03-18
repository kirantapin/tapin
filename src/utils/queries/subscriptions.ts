import { supabase } from "../supabase_client";
import { Subscription, UserSubscription } from "../../types";
export async function getSubscriptionByRestaurant(
  restaurant_id: string
): Promise<Subscription[]> {
  if (!restaurant_id) {
    console.warn("Restaurant ID is required.");
    return [];
  }

  try {
    // Query the subscriptions table
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .single();

    if (error) {
      console.error("Error fetching restaurant subscriptions:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("No subscriptions found for the given restaurant ID.");
      return [];
    }

    return data as Subscription[];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}

export async function getSubscriptionsByIds(
  subscription_ids: string[]
): Promise<Subscription[]> {
  if (!subscription_ids || subscription_ids.length === 0) {
    console.warn("A list of subscription IDs is required.");
    return [];
  }

  try {
    // Query the subscriptions table
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("subscription_id", subscription_ids);

    if (error) {
      console.error("Error fetching subscriptions by IDs:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("No subscriptions found for the given IDs.");
      return [];
    }

    return data as Subscription[];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}

// export async function getUserSubscription(
//   user_id: string,
//   restaurant_id: string
// ): Promise<UserSubscription | null> {
//   if (!user_id || !restaurant_id) {
//     console.warn("Both user_id and restaurant_id are required.");
//     return null;
//   }

//   try {
//     const { data, error } = await supabase
//       .from("user_subscriptions")
//       .select("*")
//       .eq("user_id", user_id)
//       .eq("restaurant_id", restaurant_id)
//       .single(); // Ensure we get a single row

//     if (error) {
//       console.error("Error fetching user subscription status:", error.message);
//       return null;
//     }

//     if (!data) {
//       console.warn(
//         "No subscription found for this user at the specified restaurant."
//       );
//       return null;
//     }

//     return data as UserSubscription;
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return null;
//   }
// }

// export async function getSubscriptionById(
//   subscription_id: string | null
// ): Promise<Subscription | null> {
//   if (!subscription_id) {
//     console.warn("Subscription ID is required.");
//     return null;
//   }

//   try {
//     const { data, error } = await supabase
//       .from("subscriptions") // Target the subscriptions table
//       .select("*") // Fetch all columns
//       .eq("subscription_id", subscription_id) // Filter by subscription_id
//       .single(); // Ensure only one row is returned

//     if (error) {
//       console.error("Error fetching subscription:", error.message);
//       return null;
//     }

//     if (!data) {
//       console.warn("No subscription found with the given ID.");
//       return null;
//     }

//     return data as Subscription;
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return null;
//   }
// }
