import React from "react";
import { Check } from "lucide-react";
import { PolicyCard } from "./policy_card.tsx";

interface Policy {
  title: string;
  description: string;
  isLimitedTime: boolean;
  expirationDate?: string;
  isDeal: boolean;
}

interface SubscriptionCardProps {
  name: string;
  price: number;
  interval: "month" | "year";
  policies: Policy[];
  primaryColor: string;
  secondaryColor: string;
}

export function SubscriptionCard({
  name,
  price,
  interval,
  policies,
  primaryColor,
  secondaryColor,
}: SubscriptionCardProps) {
  return (
    <div
      className="rounded-xl p-6 text-white relative overflow-hidden"
      style={{
        backgroundColor: primaryColor,
        boxShadow: `0 4px 6px -1px ${secondaryColor}`,
      }}
    >
      {/* Yellow brand accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#F5B14C]"></div>

      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <div className="text-3xl font-bold text-[#F5B14C] mb-4">
        ${price}
        <span className="text-lg text-gray-300">/{interval}</span>
      </div>
      <ul className="mb-6">
        {policies.map((policy, index) => (
          <li key={index} className="flex items-start mb-2">
            <Check className="w-5 h-5 text-[#F5B14C] mr-2 flex-shrink-0 mt-1" />
            <span>{policy.title}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-bold mb-2">Included Deals:</h3>
        {policies.map((policy, index) => (
          <PolicyCard
            key={index}
            {...policy}
            primaryColor={secondaryColor}
            secondaryColor={primaryColor}
          />
        ))}
      </div>
      <button className="w-full bg-[#F5B14C] text-black py-3 rounded-full text-lg font-medium hover:bg-[#E4A43B] transition-colors">
        Subscribe Now
      </button>
    </div>
  );
}
