import { supabase } from "./supabase_client";

export const fetchImage = async (tag: string) => {
  const bucketName = "restaurant_images"; // Replace with your bucket name
  const filePath = tag; // Replace with your file path

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error("Error downloading image:", error.message);
    return;
  }

  // Create a URL for the downloaded Blob
  const url = URL.createObjectURL(data);
  return url;
};

export const getRestaurantImageTag = (id: string): string => {
  return id + ".jpg";
};
