import { Policy, Restaurant } from "@/types";
import { convertUtcToLocal } from "@/utils/time";
import { PolicyUtils } from "@/utils/policy_utils";

export function PolicyDescriptionDisplay({
  policy,
  restaurant,
  showActionDescription = true,
  showRequirements = true,
}: {
  policy: Policy;
  restaurant: Restaurant;
  showActionDescription?: boolean;
  showRequirements?: boolean;
}) {
  const { actionDescription, conditionDescriptions } =
    PolicyUtils.policyToStringDescription(policy, restaurant);

  return (
    <div>
      {showActionDescription && (
        <p className="text-lg font-normal text-black">{actionDescription}</p>
      )}
      {showRequirements && conditionDescriptions.length > 0 && (
        <p className="font-normal text-lg text-black">Requirements :</p>
      )}
      <ul
        style={{ listStyleType: "disc", paddingLeft: "20px", marginBottom: 6 }}
      >
        {conditionDescriptions.map(
          (conditionDescription: string, index: number) => (
            <li key={index} className="font-normal text-lg text-black">
              {conditionDescription}
            </li>
          )
        )}
      </ul>
      <span className="text-xs">
        {policy.end_time &&
          "This Offer is valid until " +
            convertUtcToLocal(policy.end_time, restaurant.metadata.timeZone) +
            "."}{" "}
        Items must be unmodified to be counted towards a deal.
      </span>
    </div>
  );
}
