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

export const OffersSkeleton = () => {
  return (
    <div className="bg-white px-4 pt-4 pb-24 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton circle width={32} height={32} {...skeletonStyles} />
        <Skeleton width={150} height={20} {...skeletonStyles} />
        <div className="w-8" /> {/* empty spacing */}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-2">
        {[1, 2].map((_, i) => (
          <Skeleton
            key={i}
            width={80}
            height={32}
            borderRadius={16}
            {...skeletonStyles}
          />
        ))}
      </div>

      {/* Offer Cards */}
      <div className="space-y-5">
        {[1, 2, 3, 4].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border pt-4 pr-4 pl-4 relative bg-gray-50 space-y-2"
          >
            {/* Badge */}
            <div className="w-24 h-6 mb-1">
              <Skeleton
                width="100%"
                height="100%"
                borderRadius={12}
                {...skeletonStyles}
              />
            </div>

            {/* Title row */}
            <div className="flex items-center gap-2">
              <Skeleton width={140} height={20} {...skeletonStyles} />
            </div>

            {/* Subtext */}
            <Skeleton width="70%" height={14} {...skeletonStyles} />

            {/* Description */}
            <Skeleton width="70%" height={14} {...skeletonStyles} />

            {/* Plus button */}
            <div className="absolute right-4 bottom-4">
              <Skeleton circle width={28} height={28} {...skeletonStyles} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
