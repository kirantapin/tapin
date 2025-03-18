import { Policy } from "@/types";
import { policyToStringDescription } from "@/utils/parse";
import React from "react";

export function PolicyDescriptionDisplay({ policy }: { policy: Policy }) {
  const { actionDescription, conditionDescriptions } =
    policyToStringDescription(policy);

  return (
    <div>
      <p>{actionDescription}</p>
      {conditionDescriptions.length > 0 && <p>Requirements:</p>}
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        {conditionDescriptions.map(
          (conditionDescription: string, index: number) => (
            <li key={index}>{conditionDescription}</li>
          )
        )}
      </ul>
    </div>
  );
}
