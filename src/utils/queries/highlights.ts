import { supabase } from "../supabase_client";

export const fetch_highlights = async (restaurant_id: string | undefined) => {
  if (!restaurant_id) {
    return [];
  }
  const currentTime = new Date().toISOString();

  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("restaurant_id", restaurant_id)
    .or(`end_time.is.null,end_time.gt.${currentTime}`)
    .eq("active", true);

  if (error) {
    console.error("Error fetching highlights:", error);
    return [];
  }

  return data || [];
};
