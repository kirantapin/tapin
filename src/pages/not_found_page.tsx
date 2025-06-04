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
    rounded-full text-sm font-medium
    bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-black
    h-11 px-8
  "
      >
        <Home className="mr-2 h-5 w-5" />
        Back to Home
      </button>
    </div>
  );
}
