import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { X } from "lucide-react";
import { Transaction, Order } from "@/types";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { project_url, supabase } from "@/utils/supabase_client";
import { convertUtcToLocal } from "@/utils/parse";
import { RESTAURANT_IMAGE_BUCKET } from "@/constants";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderWithTransactions extends Order {
  transactions: Transaction[];
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userSession, transactions } = useAuth();
  const [ordersWithTransactions, setOrdersWithTransactions] = useState<
    OrderWithTransactions[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userSession || !transactions.length) {
        console.log("No user session or transactions");
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

    if (isOpen) {
      fetchOrders();
    }
  }, [userSession, transactions, isOpen]);

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
                <h2 className="text-2xl font-bold break-words">
                  Your Order History
                </h2>
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
                                  {convertUtcToLocal(order.created_at)}
                                </p>
                                {order.discount > 0 && (
                                  <p
                                    className="text-md text-black mt-auto"
                                    style={{ color: "#40C4AA" }}
                                  >
                                    You saved ${order.discount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                  src={`${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${order.restaurant_id}_profile.png`}
                                  alt="Restaurant"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Order Total */}
                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                              <span className="font-semibold">Total</span>
                              <span className="font-semibold">
                                $
                                {(
                                  (order.total_price || 0) + (order.tip || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No orders found</p>
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

export default OrderHistoryModal;
