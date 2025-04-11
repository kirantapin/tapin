import { Policy, Restaurant } from "@/types";
import { policyToStringDescription } from "@/utils/parse";
import React from "react";

export function PolicyDescriptionDisplay({
  policy,
  restaurant,
}: {
  policy: Policy;
  restaurant: Restaurant;
}) {
  const { actionDescription, conditionDescriptions } =
    policyToStringDescription(policy, restaurant);

  return (
    <div>
      <p className="text-lg font-bold text-black">{actionDescription}</p>
      {conditionDescriptions.length > 0 && <p>Requirements :</p>}
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        {conditionDescriptions.map(
          (conditionDescription: string, index: number) => (
            <li key={index}>{conditionDescription}</li>
          )
        )}
      </ul>
      <span className="text-xs">
        Items must be unmodified to be counted towards a deal
      </span>
    </div>
  );
}
