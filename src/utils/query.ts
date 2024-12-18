import { supabase } from "./supabase_client";

const find_closest_restaurants = async () => {
  const { latitude, longitude } = await getCurrentPositionAsync();
  console.log(latitude, longitude);
  if (!latitude || !longitude) {
    return;
  }
  try {
    const { data, error } = await supabase.functions.invoke(
      "closest_restaurant",
      {
        body: JSON.stringify({
          latitude: latitude,
          longitude: longitude,
        }),
      }
    );
    if (error) {
      return;
    }
    const restaurant_data = data[0];
    //set global context to store restaurant data
    return restaurant_data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getCurrentPositionAsync = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Call resolve when the operation succeeds
        resolve(position.coords);
      },
      (error) => {
        // Call reject when the operation fails
        reject(error);
      }
    );
  });
};
