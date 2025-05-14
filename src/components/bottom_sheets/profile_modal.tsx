import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { X } from "lucide-react";
import { RESTAURANT_IMAGE_BUCKET } from "@/constants";
import { project_url } from "@/utils/supabase_client";
import OrderHistory from "../display_utils/order_history";
import { useRestaurant } from "@/context/restaurant_context";
import CustomIcon from "../svg/custom_icon";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userSession, userData, transactions } = useAuth();
  const [userInfo, setUserInfo] = useState<
    Record<string, { points: number; credit: number; numTransactions: number }>
  >({});

  const [loading, setLoading] = useState(true);
  const { restaurant } = useRestaurant();
  useEffect(() => {
    if (userSession && userData && transactions) {
      // Get unique restaurant IDs from transactions
      const uniqueRestaurantIds = [
        ...new Set(transactions.map((t) => t.restaurant_id)),
      ].filter(Boolean);

      // Set loading state while processing
      setLoading(true);
      try {
        // Create dictionary of restaurant stats
        const restaurantStats = uniqueRestaurantIds.reduce(
          (
            acc: Record<
              string,
              { points: number; credit: number; numTransactions: number }
            >,
            restaurantId: string
          ) => {
            // Get all transactions for this restaurant
            const restaurantTransactions = transactions.filter(
              (t) => t.restaurant_id === restaurantId
            );

            // Calculate total points and credit for this restaurant
            const points = userData.points[restaurantId] || 0;
            const credit = userData.next_purchase_credit[restaurantId] || 0;

            acc[restaurantId] = {
              points,
              credit,
              numTransactions: restaurantTransactions.filter(
                (t) => t.fulfilled_by === null
              ).length,
            };
            return acc;
          },
          {}
        );

        // Set user info with restaurant stats
        setUserInfo(restaurantStats);
      } catch (error) {
        console.error("Error processing user data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [userSession, userData, transactions]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl [&>button]:hidden p-0"
        style={{
          height: userSession ? "85vh" : "30vh",
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-2xl font-bold break-words">
                  Your Profile
                </SheetTitle>
                <CustomIcon
                  circleColor={restaurant?.metadata.primaryColor as string}
                  size={26}
                />
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 bg-gray-200 rounded-full p-2 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {!userSession ? (
              <div className="px-6">
                <div className="mt-4 pt-2">
                  <p className="text-gray-600 mb-4 font-semibold">
                    Sign in to view your profile information
                  </p>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <SignInButton
                      onClose={onClose}
                      primaryColor={restaurant?.metadata.primaryColor as string}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {Object.entries(userInfo).map(([restaurantId, stats]) => {
                      if (
                        stats.points > 0 ||
                        stats.credit > 0 ||
                        stats.numTransactions > 0
                      ) {
                        return (
                          <div
                            key={restaurantId}
                            className="border rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden">
                                <img
                                  src={`${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurantId}_profile.png`}
                                  alt="Restaurant"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col gap-1 ml-auto text-right">
                                {stats.points > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-bold text-black">
                                      {stats.points}
                                    </span>{" "}
                                    Points
                                  </p>
                                )}
                                {stats.credit > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-bold text-black">
                                      ${stats.credit.toFixed(2)}
                                    </span>{" "}
                                    Credit
                                  </p>
                                )}
                                {stats.numTransactions > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-bold text-black">
                                      {stats.numTransactions}
                                    </span>{" "}
                                    Unredeemed{" "}
                                    {stats.numTransactions > 1
                                      ? "Items"
                                      : "Item"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                <OrderHistory />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileModal;
