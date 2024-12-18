import React, { useEffect, useState } from "react";
import { Restaurant } from "../types";
import { fetchImage, getRestaurantImageTag } from "../utils/image_fetcher";
import { useRestaurantData } from "../context/restaurant_context";
import { StyledImage, ImageDiv, Gradient, TextOverlay } from "../styles/styles";
import { useNavigate } from "react-router-dom";

interface RestaurantDiscoveryCardProps {
  restaurant: Restaurant;
}
export const RestaurantDiscoveryCard: React.FC<
  RestaurantDiscoveryCardProps
> = ({ restaurant }) => {
  const [restaurantImageURL, setRestaurantImageURL] = useState<string>();
  const { setRestaurant } = useRestaurantData();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const tag = getRestaurantImageTag(restaurant.id);
      const url = await fetchImage(tag);
      setRestaurantImageURL(url);
    };

    init();
  }, []);

  return (
    <div>
      {restaurantImageURL ? (
        <ImageDiv
          onClick={() => {
            navigate(`/restaurant/${restaurant.id}`);
          }}
        >
          <StyledImage src={restaurantImageURL} />
          <Gradient color="#0c5005" />
          <TextOverlay>{restaurant.name}</TextOverlay>
        </ImageDiv>
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
};
