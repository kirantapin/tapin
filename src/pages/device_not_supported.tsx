import { useDevice } from "@/context/device_context";
import { useNavigate } from "react-router-dom";
import { BASE_PATH } from "@/constants";

export default function DeviceNotSupported() {
  const { isMobileDevice } = useDevice();
  const navigate = useNavigate();
  if (isMobileDevice) {
    navigate(BASE_PATH);
  }
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
          Device not supported
        </h1>
        <p className="text-muted-foreground text-gray-600">
          Please use a mobile browser to access Tap In.
        </p>
      </div>
    </div>
  );
}
