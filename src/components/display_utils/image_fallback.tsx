import React, { useEffect, useState } from "react";
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

export const ImageFallback = ({
  src,
  alt,
  className,
  style,
  restaurant,
  postFunction,
}: ImageFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = ImageUtils.getProfileImageUrl(restaurant);

  useEffect(() => {
    setHasError(false); // reset on src change
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setHasError(false);
    img.onerror = () => {
      setHasError(true);
      postFunction?.();
    };
  }, [src]);

  if (!restaurant) return null;

  return (
    <img
      src={hasError ? fallbackSrc : src}
      alt={alt}
      className={`${hasError ? "rounded-full p-3" : ""} ${className} `}
      style={style}
      onError={() => {
        setHasError(true);
        postFunction?.();
      }}
    />
  );
};
