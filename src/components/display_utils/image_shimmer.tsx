import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ImageShimmerProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageShimmer = ({
  src,
  alt,
  className = "",
  style,
}: ImageShimmerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false); // Reset on src change
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  if (!isLoaded) {
    return (
      <Skeleton
        width="100%"
        height="100%"
        baseColor="#e5e7eb"
        highlightColor="#d1d5db"
        style={{
          margin: 0,
          padding: 0,
          display: "block",
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      style={{ ...style, opacity: 0 }}
      onLoad={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    />
  );
};
