import { Check, GlassWater } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CoverDeals() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button className="mb-8">
        <ArrowLeft
          className="w-6 h-6"
          onClick={() => {
            navigate(-1);
          }}
        />
      </button>

      <h1 className="text-2xl font-bold mb-6">Passes</h1>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Elite Membership Card */}
        <div className="rounded-3xl border-2 bg-white p-6 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Ultra Bar Elite</h1>
            </div>
            <p className="mt-2 text-xl font-semibold text-[#F5B14C]">
              $19.99/month
            </p>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#F5B14C]" />
              <span>Free welcome drink</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#F5B14C]" />
              <span>50% off line skip</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#F5B14C]" />
              <span>No cover charge</span>
            </li>
          </ul>
        </div>

        {/* Additional Services */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative rounded-3xl border bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Line Skip + Drink</h2>
              <div className="space-y-1 text-right">
                <span className="text-sm text-gray-500 line-through">
                  $45.30
                </span>
                <span className="block text-lg font-bold text-[#F5B14C]">
                  $15.00
                </span>
              </div>
            </div>
            <span className="mt-4 inline-block rounded-full bg-[#F5B14C]/10 px-3 py-1 text-sm text-[#F5B14C]">
              50% OFF
            </span>
            {/* Drink Icon */}
            <GlassWater className="absolute bottom-4 right-4 h-8 w-8 text-black" />
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cover Charge</h2>
              <span className="text-lg font-bold">$10.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
