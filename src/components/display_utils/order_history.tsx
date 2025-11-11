import { useEffect, useState } from "react";
import { RecentOrder } from "@/types";
import { useAuth } from "@/context/auth_context";
import { project_url } from "@/utils/supabase_client";
import { convertUtcToLocal } from "@/utils/time";
import { MAX_TRANSACTION_LOOKBACK, RESTAURANT_IMAGE_BUCKET } from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";
import { TransactionUtils } from "@/utils/transaction_utils";
import { ItemUtils } from "@/utils/item_utils";
import { titleCase } from "title-case";

const OrderHistory = () => {
  const { userSession } = useAuth();
  const { restaurant } = useRestaurant();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userSession || !restaurant) {
        return;
      }

      setLoading(true);
      try {
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - MAX_TRANSACTION_LOOKBACK);

        const orders = await TransactionUtils.fetchRecentOrders(
          restaurant,
          userSession.user.id,
          startTime,
          endTime
        );
        setRecentOrders(orders);
      } catch (error) {
        console.error("Error in fetchOrders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userSession, restaurant]);

  if (!restaurant) {
    return null;
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pt-4 pb-40">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold break-words">
            Your Orders at {restaurant.name}
          </h2>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent mx-auto" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders
                .sort(
                  (a, b) =>
                    new Date(b.order.created_at).getTime() -
                    new Date(a.order.created_at).getTime()
                )
                .map((recentOrder) => {
                  const { order, transactions } = recentOrder;
                  return (
                    <div
                      key={order.order_id}
                      className="border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col h-full justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-black">
                              {restaurant.name || "Restaurant"}
                            </p>
                            <p className="text-sm text-gray-600">{" • "}</p>
                            <p className="text-sm text-gray-600">
                              {convertUtcToLocal(
                                order.created_at,
                                Intl.DateTimeFormat().resolvedOptions().timeZone
                              )}
                            </p>
                          </div>
                          {order.metadata?.discount &&
                            order.metadata?.discount > 0 && (
                              <p
                                className="text-sm text-black mt-auto"
                                style={{ color: "#40C4AA" }}
                              >
                                You saved $
                                {order.metadata?.discount?.toFixed(2)}
                              </p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={`${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/profile/${order.restaurant_id}`}
                            alt="Restaurant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Order Items */}
                      {transactions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-700">
                            {transactions
                              .map((transaction) => {
                                const item =
                                  TransactionUtils.getTransactionItem(
                                    transaction
                                  );
                                // Try to get menu item from current restaurant context first
                                // If not available, we'll just use the item ID as fallback
                                if (restaurant) {
                                  const menuItem =
                                    ItemUtils.getMenuItemFromItemId(
                                      item.id,
                                      restaurant
                                    );
                                  if (menuItem) {
                                    return titleCase(
                                      ItemUtils.getItemName(item, restaurant)
                                    );
                                  }
                                }
                                // Fallback to item ID if restaurant context doesn't have this item
                                return titleCase("Unknown Item");
                              })
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      )}

                      {/* Order Total */}
                      <div className="mt-4 pt-3 border-t flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          ${(order.total_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
