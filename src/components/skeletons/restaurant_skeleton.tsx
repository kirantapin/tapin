import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const RestaurantSkeleton = () => {
  return (
    <div className="bg-white relative pb-10 min-h-screen">
      {/* Header Icons */}
      <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
        <div className="w-9 h-9 rounded-full overflow-hidden">
          <Skeleton
            circle
            width="100%"
            height="100%"
            baseColor="#e5e7eb"
            highlightColor="#d1d5db"
          />
        </div>

        <div className="flex items-center gap-5">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <Skeleton
              circle
              width="100%"
              height="100%"
              baseColor="#e5e7eb"
              highlightColor="#d1d5db"
            />
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <Skeleton
              circle
              width="100%"
              height="100%"
              baseColor="#e5e7eb"
              highlightColor="#d1d5db"
            />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-48 w-full rounded-b-xl overflow-hidden">
        <Skeleton
          width="100%"
          height="100%"
          baseColor="#e5e7eb"
          highlightColor="#d1d5db"
          style={{
            margin: 0,
            padding: 0,
            display: "block",
          }}
        />
      </div>

      {/* Restaurant Info + Action Buttons */}
      <div className="mt-10 px-4 space-y-4">
        {/* Restaurant Name */}
        <div className="w-2/3 h-6">
          <Skeleton
            width="100%"
            height="100%"
            baseColor="#e5e7eb"
            highlightColor="#d1d5db"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-11 rounded-full overflow-hidden border border-gray-200 shadow-sm"
            >
              <Skeleton
                width="100%"
                height="100%"
                baseColor="#e5e7eb"
                highlightColor="#d1d5db"
                style={{
                  margin: 0,
                  padding: 0,
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="mt-6 w-full h-[120px] rounded-3xl overflow-hidden">
          <Skeleton
            width="100%"
            height="100%"
            baseColor="#e5e7eb"
            highlightColor="#d1d5db"
            style={{
              margin: 0,
              padding: 0,
              display: "block",
            }}
          />
        </div>

        {/* "My Spot" Section */}
        <div className="mt-8 space-y-3">
          {/* Section Title */}
          <div className="w-32 h-6">
            <Skeleton
              width="100%"
              height="100%"
              baseColor="#e5e7eb"
              highlightColor="#d1d5db"
            />
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg shadow space-y-2"
              >
                <Skeleton
                  height={20}
                  width="60%"
                  baseColor="#e5e7eb"
                  highlightColor="#d1d5db"
                />
                <Skeleton
                  height={14}
                  width="80%"
                  baseColor="#e5e7eb"
                  highlightColor="#d1d5db"
                />
                <Skeleton
                  height={12}
                  width="40%"
                  baseColor="#e5e7eb"
                  highlightColor="#d1d5db"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Access Cards Section */}
        <div className="mt-8 space-y-3">
          {/* Section Title */}
          <div className="w-40 h-6">
            <Skeleton
              width="100%"
              height="100%"
              baseColor="#e5e7eb"
              highlightColor="#d1d5db"
              style={{
                margin: 0,
                padding: 0,
                display: "block",
              }}
            />
          </div>

          {/* Access Cards */}
          <div className="overflow-x-hidden">
            <div className="flex gap-4">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px] h-[160px] rounded-xl overflow-hidden"
                >
                  <Skeleton
                    width="100%"
                    height="100%"
                    baseColor="#e5e7eb"
                    highlightColor="#d1d5db"
                    style={{
                      margin: 0,
                      padding: 0,
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
