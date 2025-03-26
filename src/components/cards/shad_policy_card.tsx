import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beer } from "lucide-react";
import { Policy } from "@/types";
import { project_url } from "@/utils/supabase_client";
import { SINGLE_POLICY_PAGE_PATH } from "@/constants";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { titleCase } from "title-case";
import { sentenceCase } from "@/utils/parse";

export default function PolicyCard({
  policy,
  primaryColor,
}: {
  policy: Policy;
  primaryColor: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div
      className="w-[280px] flex-shrink-0"
      onClick={() => {
        navigate(
          SINGLE_POLICY_PAGE_PATH.replace(":id", policy.restaurant_id).replace(
            ":policy_id",
            policy.policy_id
          ),
          {
            state: {
              previousPage: location.pathname,
            },
          }
        );
      }}
    >
      <Card className="overflow-hidden border relative bg-white px-2 py-1 rounded-[20px] aspect-[5/5]">
        {/* Image Container */}
        <div className="relative rounded-[20px] overflow-hidden p-1.5 mb-2.5">
          <img
            src={
              policy.image_url ||
              `${project_url}/storage/v1/object/public/restaurant_images/${policy.restaurant_id}_profile.png`
            }
            alt="TapIn Logo"
            className="w-full aspect-[216/112] object-cover rounded-2xl"
            onError={(e) => {
              e.currentTarget.src = ""; //this should be changed to a generic tapin logo in public directory
            }}
          />
          {/* Savings Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/65 rounded-lg px-2 py-1">
            {/* Yellow Percentage Icon */}
            <div className="w-5 h-5 rounded-full bg-[#FFD700] flex items-center justify-center">
              <span className="text-black text-xs">%</span>
            </div>

            {/* Discount Text */}
            <span className="text-[#FFD700] font-semibold text-sm">
              Save $2 Per Shot
            </span>
          </div>
        </div>

        <CardContent className="px-2 flex flex-col justify-between h-[calc(100%-theme(space.1)-var(--image-height)-0.5rem)]">
          {/* Title and Button Row */}
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold text-black pr-2">
              {titleCase(policy.name)}
            </h2>
            <Button
              size="icon"
              className="rounded-full   w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Price with Icon */}
          <div className="flex items-start gap-2 text-gray-600 mt-3 flex-wrap">
            <Beer className="h-5 w-5 flex-shrink-0" />
            <span className="text-base break-words whitespace-normal min-w-0 flex-1">
              {sentenceCase(policy.header)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
