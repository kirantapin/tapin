import { supabase } from "./supabase_client";

export const submit_drink_order = async (drink_order, menu) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "submit_drink_query",
      {
        body: JSON.stringify({ drink_order: drink_order, menu: menu }),
      }
    );
    if (error) throw error;
    const { response } = data;
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
