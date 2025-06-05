import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const skeletonStyles = {
  baseColor: "#e5e7eb",
  highlightColor: "#d1d5db",
  style: {
    margin: 0,
    padding: 0,
    display: "block",
  },
};
export const HighlightCardSkeleton = () => {
  return (
    <div className="snap-center flex-shrink-0 w-full max-w-md h-32 rounded-3xl overflow-hidden flex items-stretch mr-4 relative">
      {/* Background skeleton */}
      <div className="absolute inset-0">
        <Skeleton {...skeletonStyles} className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
        <div>
          {/* Title skeleton */}
          <Skeleton {...skeletonStyles} className="w-[70%] h-6 mb-2" />
          {/* Description skeleton */}
          <Skeleton {...skeletonStyles} className="w-[60%] h-4 mb-1" />
          <Skeleton {...skeletonStyles} className="w-[40%] h-4" />
        </div>

        {/* Button skeleton */}
        <Skeleton
          {...skeletonStyles}
          className="w-[100px] h-[30px] rounded-full"
        />
      </div>
    </div>
  );
};
