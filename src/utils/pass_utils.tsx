import { supabase } from "./supabase_client";

export class PassUtils {
  static fetchPasses = async (restaurantId: string | null): Promise<any> => {
    const { data, error } = await supabase
      .from("passes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("end_time", new Date().toISOString());
    if (error) {
      console.error("Error fetch temporary items.", error.message);
      return {};
    }

    return data;
  };

  static fetchPassAmountRemaining = async (
    passId: string
  ): Promise<number | null> => {
    const { data, error } = await supabase
      .from("passes")
      .select("amount_remaining")
      .eq("pass_id", passId)
      .single();
    if (error) {
      console.error("Error fetch pass amount remaining.", error.message);
      return null;
    }
    return data.amount_remaining;
  };
}
