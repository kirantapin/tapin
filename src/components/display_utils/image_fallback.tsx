import React, { useState } from "react";
import { Restaurant } from "@/types";
import { ImageUtils } from "@/utils/image_utils";

interface ImageFallbackProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  restaurant: Restaurant;
  postFunction?: () => void;
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className,
  style,
  restaurant,
  postFunction,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!restaurant) return null;

  const fallbackSrc = ImageUtils.getProfileImageUrl(restaurant) || "";

  return (
    <img
      src={hasError ? fallbackSrc : src}
      alt={alt}
      className={`${className} ${hasError ? "rounded-full" : ""}`}
      style={style}
      onError={() => {
        setHasError(true);
        postFunction?.();
      }}
    />
  );
};
