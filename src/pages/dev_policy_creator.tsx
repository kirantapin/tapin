import React, { useEffect, useState } from "react";
import { useSupabase } from "../context/supabase_context";
import { useRestaurantData } from "../context/restaurant_context";

const DevPolicyCreator: React.FC = () => {
  //build cart with policy conditions
  const supabase = useSupabase();
  const [error, setError] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string>();
  const { restaurant, loadingRestaurantData } = useRestaurantData();

  useEffect(() => {
    const fetchImage = async () => {
      const bucketName = "restaurant_images"; // Replace with your bucket name
      const filePath = `${restaurant?.id}.jpg`; // Replace with your file path

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error("Error downloading image:", error.message);
        setError(error.message);
        return;
      }

      // Create a URL for the downloaded Blob
      const url = URL.createObjectURL(data);
      setImageUrl(url);
    };
    if (!loadingRestaurantData) {
      fetchImage();
    }
  }, [loadingRestaurantData]);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Fetched from Supabase"
          style={{ maxWidth: "100%" }}
        />
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
};

export default DevPolicyCreator;
