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

export const CheckoutSkeleton = () => {
  return (
    <div className="bg-white px-4 py-5 min-h-screen space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8">
          <Skeleton circle width="100%" height="100%" {...skeletonStyles} />
        </div>
        <div className="w-1/3 h-6">
          <Skeleton width="100%" height="100%" {...skeletonStyles} />
        </div>
        <div className="w-8 h-8" />
      </div>

      {/* Cart Items */}
      <div className="space-y-6 pt-6">
        {[1, 2, 3].map((_, i) => (
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

      {/* Exclusive Deals Timer */}
      <div className="mt-4 flex items-center gap-2">
        <Skeleton width={120} height={16} {...skeletonStyles} />
        <Skeleton width={60} height={16} {...skeletonStyles} />
      </div>

      {/* Exclusive Deal Card */}
      <div className=" p-4 rounded-xl border bg-gray-50 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton width={100} height={20} {...skeletonStyles} />
          <Skeleton width={80} height={20} {...skeletonStyles} />
        </div>
        <Skeleton width="80%" height={18} {...skeletonStyles} />
        <Skeleton width="100%" height={12} {...skeletonStyles} />
      </div>

      {/* Save More Section */}
      <div className="mt-6">
        <Skeleton
          width={120}
          height={20}
          className="mb-3"
          {...skeletonStyles}
        />

        <div className="flex flex-col gap-4">
          {[1, 2].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-gray-50 space-y-3">
              <Skeleton width={100} height={20} {...skeletonStyles} />
              <Skeleton width="60%" height={16} {...skeletonStyles} />
              <Skeleton width="80%" height={12} {...skeletonStyles} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
