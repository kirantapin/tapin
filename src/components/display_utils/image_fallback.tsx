import React, { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { ImageUtils } from "@/utils/image_utils";

interface ImageFallbackProps {
  src: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  restaurant: Restaurant;
  postFunction?: () => void;
}

export const ImageFallback = ({
  src,
  alt,
  className,
  style,
  restaurant,
  postFunction,
}: ImageFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fallbackSrc = ImageUtils.getProfileImageUrl(restaurant);

  useEffect(() => {
    setHasError(false); // reset on src change
    setIsLoaded(false); // reset loaded state

    const img = new Image();
    img.src = src || "";
    img.onload = () => {
      setHasError(false);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
      postFunction?.();
    };
  }, [src]);

  if (!restaurant) return null;

  return (
    <img
      src={(hasError ? fallbackSrc : src) || undefined}
      alt={alt}
      className={`${
        hasError ? "rounded-full p-3" : ""
      } ${className} transition-opacity duration-500 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={style}
      onError={() => {
        setHasError(true);
        setIsLoaded(true);
        postFunction?.();
      }}
    />
  );
};
