import React, { useEffect, useState } from "react";
import { Transaction, Order } from "@/types";
import { useAuth } from "@/context/auth_context";
import { project_url, supabase } from "@/utils/supabase_client";
import { convertUtcToLocal } from "@/utils/time";
import { RESTAURANT_IMAGE_BUCKET } from "@/constants";
import { useRestaurant } from "@/context/restaurant_context";

interface OrderWithTransactions extends Order {
  transactions: Transaction[];
}

const OrderHistory = () => {
  const { userSession, transactions } = useAuth();
  const { restaurant } = useRestaurant();
  const [ordersWithTransactions, setOrdersWithTransactions] = useState<
    OrderWithTransactions[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userSession || !transactions.length || !restaurant) {
        return;
      }

      setLoading(true);
      try {
        // Get unique order_ids
        const uniqueOrderIds = [
          ...new Set(transactions.map((t) => t.order_id)),
        ].filter(Boolean);

        if (uniqueOrderIds.length === 0) return;

        // Query orders table for these IDs
        const { data: orderData, error } = await supabase
          .from("orders")
          .select("*")
          .in("order_id", uniqueOrderIds);

        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }

        // Combine orders with their transactions
        const ordersWithTransactions = orderData.map((order) => ({
          ...order,
          transactions: transactions.filter(
            (t) => t.order_id === order.order_id
          ),
        }));
        setOrdersWithTransactions(ordersWithTransactions);
      } catch (error) {
        console.error("Error in fetchOrders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userSession, transactions, restaurant]);

  if (!restaurant) {
    return null;
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pt-4 pb-40">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold break-words">Your Order History</h2>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent mx-auto" />
            </div>
          ) : ordersWithTransactions.length > 0 ? (
            <div className="space-y-4">
              {ordersWithTransactions
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((order) => (
                  <div
                    key={order.order_id}
                    className="border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col h-full justify-between">
                        <p className="text-sm text-black">
                          {convertUtcToLocal(
                            order.created_at,
                            restaurant.metadata.timeZone
                          )}
                        </p>
                        {order.metadata?.discount &&
                          order.metadata?.discount > 0 && (
                            <p
                              className="text-md text-black mt-auto"
                              style={{ color: "#40C4AA" }}
                            >
                              You saved ${order.metadata?.discount?.toFixed(2)}
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

                    {/* Order Total */}
                    <div className="mt-4 pt-3 border-t flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        ${(order.total_price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
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
