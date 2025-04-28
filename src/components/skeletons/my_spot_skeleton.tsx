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

export const MySpotSkeleton = () => {
  return (
    <div className="bg-white px-4 pt-4 pb-28 min-h-screen flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton circle width={32} height={32} {...skeletonStyles} />
          <Skeleton width={100} height={20} {...skeletonStyles} />
          <div className="w-8" /> {/* spacing placeholder */}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton height={32} borderRadius={16} {...skeletonStyles} />
            </div>
          ))}
        </div>

        {/* Subtext */}
        <div className="mb-4">
          <Skeleton width={220} height={12} {...skeletonStyles} />
        </div>

        {/* Item Cards */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded overflow-hidden">
                <Skeleton width="100%" height="100%" {...skeletonStyles} />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={18} {...skeletonStyles} />
                <Skeleton width="40%" height={14} {...skeletonStyles} />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton circle width={20} height={20} {...skeletonStyles} />
                <Skeleton width={20} height={20} {...skeletonStyles} />
                <Skeleton circle width={20} height={20} {...skeletonStyles} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="rounded-full overflow-hidden h-12">
          <Skeleton width="100%" height="100%" {...skeletonStyles} />
        </div>
      </div>
    </div>
  );
};
