import React from "react";
import { Clock, Infinity, Tag } from "lucide-react";

interface PolicyCardProps {
  title: string;
  description: string;
  isLimitedTime: boolean;
  expirationDate?: string;
  isDeal: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export function PolicyCard({
  title,
  description,
  isLimitedTime,
  expirationDate,
  isDeal,
  primaryColor,
  secondaryColor,
}: PolicyCardProps) {
  return (
    <div
      className={`rounded-xl p-6 text-white relative overflow-hidden`}
      style={{
        backgroundColor: primaryColor,
        // boxShadow: `0 4px 6px -1px ${secondaryColor}`,
      }}
    >
      {/* Yellow brand accent */}
      {/* <div className="absolute top-0 left-0 w-full h-1 bg-[#F5B14C]"></div> */}

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{title}</h3>
        {isDeal && <Tag className="w-5 h-5 text-[#F5B14C]" />}
      </div>
      <p className="text-gray-200 mb-4">{description}</p>
      <div className="flex items-center text-[#F5B14C]">
        {isLimitedTime ? (
          <>
            <Clock className="w-5 h-5 mr-2" />
            <span>Limited time offer - Expires {expirationDate}</span>
          </>
        ) : (
          <>
            <Infinity className="w-5 h-5 mr-2" />
            <span>Permanent offer</span>
          </>
        )}
      </div>
    </div>
  );
}
