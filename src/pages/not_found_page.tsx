import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_PATH } from "../constants";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <img
        src="/tapin_logo_black.png"
        alt="Tap In Logo"
        width={120}
        height={40}
        className=""
      />

      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Page not found
        </h1>
        <p className="text-muted-foreground text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>

      <button
        onClick={() => navigate(BASE_PATH)}
        className="
    inline-flex items-center justify-center
    rounded-md text-sm font-medium
    ring-offset-background transition-colors
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-ring
    focus-visible:ring-offset-2
    disabled:pointer-events-none
    disabled:opacity-50
    bg-[#F5B14C] text-black
    h-11 px-8
  "
      >
        <Home className="mr-2 h-4 w-4" />
        Back to home
      </button>
    </div>
  );
}
