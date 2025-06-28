import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import {
  BASE_PATH,
  RESTAURANT_PATH,
  MY_SPOT_PATH,
  OFFERS_PAGE_PATH,
  INFO_PAGE_PATH,
  NOT_FOUND_PATH,
} from "./constants.ts";
import { Slide, ToastContainer } from "react-toastify";
// import { RestaurantSkeleton } from "./components/skeletons/restaurant_skeleton.tsx";
import { MySpotSkeleton } from "./components/skeletons/my_spot_skeleton.tsx";
import { OffersSkeleton } from "./components/skeletons/offers_skeleton.tsx";
import LoadingPage from "./components/skeletons/loading_page.tsx";
import { useRestaurant } from "./context/restaurant_context.tsx";
// Lazy imports
const Discovery = lazy(() => import("./pages/discovery.tsx"));
const NotFoundPage = lazy(() => import("./pages/not_found_page.tsx"));
const MySpotContent = lazy(() => import("./pages/my_spot_content.tsx"));
const PoliciesPage = lazy(() => import("./pages/policies.tsx"));
const RestaurantInfo = lazy(() => import("./pages/restaurant_info.tsx"));

const RestaurantPage = lazy(() => import("./pages/restaurant.tsx"));

const App: React.FC = () => {
  return (
    <div>
      <ToastContainer
        transition={Slide}
        position="top-center"
        closeOnClick
        draggable={false}
        pauseOnHover={false}
        stacked
        className="w-full"
        style={{ width: "100%", top: 0, marginTop: 0, paddingTop: 0 }}
      />

      <Routes>
        <Route
          path={BASE_PATH}
          element={
            <Suspense fallback={null}>
              <Discovery />
            </Suspense>
          }
        />
        <Route
          path={RESTAURANT_PATH}
          element={
            <Suspense fallback={<LoadingPage />}>
              <RequireRestaurant>
                <RestaurantPage />
              </RequireRestaurant>
            </Suspense>
          }
        />
        <Route
          path={OFFERS_PAGE_PATH}
          element={
            <Suspense fallback={<OffersSkeleton />}>
              <RequireRestaurant>
                <PoliciesPage />
              </RequireRestaurant>
            </Suspense>
          }
        />
        <Route
          path={INFO_PAGE_PATH}
          element={
            <Suspense fallback={null}>
              <RequireRestaurant>
                <RestaurantInfo />
              </RequireRestaurant>
            </Suspense>
          }
        />
        <Route
          path={MY_SPOT_PATH}
          element={
            <Suspense fallback={<MySpotSkeleton />}>
              <RequireRestaurant>
                <MySpotContent />
              </RequireRestaurant>
            </Suspense>
          }
        />
        <Route
          path={NOT_FOUND_PATH}
          element={
            <Suspense fallback={null}>
              <NotFoundPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={null}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

const RequireRestaurant: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { id } = useParams();
  const { restaurant, setCurrentRestaurantId, policyManager } = useRestaurant();

  const [hasWaitedMinimum, setHasWaitedMinimum] = useState(false);
  const lastRestaurantId = useRef<string | null>(null);

  // Update the current restaurant
  useEffect(() => {
    if (id) setCurrentRestaurantId(id);
  }, [id]);

  // Trigger loading only if navigating to a *new* restaurant
  useEffect(() => {
    const isNavigatingToNewRestaurant = id && id !== lastRestaurantId.current;

    if (isNavigatingToNewRestaurant) {
      setHasWaitedMinimum(false);
      const timeout = setTimeout(() => {
        setHasWaitedMinimum(true);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setHasWaitedMinimum(true); // skip animation if same restaurant
    }
  }, [id]);

  // Update last known restaurant id once restaurant has loaded
  useEffect(() => {
    if (restaurant?.id) {
      lastRestaurantId.current = restaurant.id;
    }
  }, [restaurant?.id]);

  const isLoading =
    !restaurant || !policyManager || !hasWaitedMinimum || restaurant.id !== id;

  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default App;
