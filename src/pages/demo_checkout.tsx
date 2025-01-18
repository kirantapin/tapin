import React, { useState } from "react";
import { ArrowLeft, CreditCard, DollarSign } from "lucide-react";

interface LineItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, name: "VIP Pass", price: 50, quantity: 1 },
    { id: 2, name: "Drink Tokens", price: 10, quantity: 5 },
    { id: 3, name: "Fast Track Entry", price: 25, quantity: 1 },
  ]);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + tax;

  const updateQuantity = (id: number, newQuantity: number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button className="mb-8">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="space-y-4 mb-8">
        {lineItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-400">
                ${item.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center">
              <button
                className="w-8 h-8 rounded-full bg-[#2A2F45] flex items-center justify-center"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="mx-3">{item.quantity}</span>
              <button
                className="w-8 h-8 rounded-full bg-[#2A2F45] flex items-center justify-center"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg font-medium flex items-center justify-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Pay with Card
        </button>
        <button className="w-full bg-[#2A2F45] text-white py-4 rounded-full text-lg font-medium flex items-center justify-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Pay with Cash
        </button>
      </div>
    </div>
  );
}
