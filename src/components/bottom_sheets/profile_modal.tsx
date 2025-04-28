import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";

import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { X } from "lucide-react";
import { RESTAURANT_IMAGE_BUCKET } from "@/constants";
import { project_url } from "@/utils/supabase_client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userSession, userData, transactions } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  const [loading, setLoading] = useState(true);

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
          (acc, restaurantId) => {
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
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[userSession ? 0.9 : 0.3, 0]}
      initialSnap={0}
      tweenConfig={{
        duration: 0.2,
        ease: [0.4, 0, 0.6, 1],
      }}
    >
      <Sheet.Container className="rounded-t-3xl">
        <Sheet.Content>
          <div className="relative h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 pb-40">
              <button
                onClick={onClose}
                className="text-gray-500 bg-gray-200 rounded-full p-2 float-right"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold break-words">Your Profile</h2>
                <img
                  src="/tapin_icon_black.png"
                  alt="Tap In Icon"
                  className="w-7 h-7"
                />
              </div>

              {!userSession ? (
                <div className="mt-4">
                  <p className="text-gray-600 mb-4 font-semibold">
                    Sign in to view your profile information
                  </p>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <SignInButton onClose={onClose} />
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                                      <span className="font-bold">
                                        {stats.points}
                                      </span>{" "}
                                      Points
                                    </p>
                                  )}
                                  {stats.credit > 0 && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-bold">
                                        ${stats.credit.toFixed(2)}
                                      </span>{" "}
                                      Credit
                                    </p>
                                  )}
                                  {stats.numTransactions > 0 && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-bold">
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
                </div>
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default ProfileModal;
