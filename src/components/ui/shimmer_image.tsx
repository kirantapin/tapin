import React, { useState } from "react";

interface ShimmerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  shimmerClassName?: string;
}

const ShimmerImage: React.FC<ShimmerImageProps> = ({
  shimmerClassName = "",
  className = "",
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse rounded ${shimmerClassName}`}
        />
      )}
      {/* Actual image */}
      <img
        {...props}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default ShimmerImage;
