import { useAuth } from "@/context/auth_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";

interface SignInButtonProps {
  onClose: () => void;
  primaryColor: string;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  onClose = () => {},
  primaryColor,
}) => {
  const { openSignInModal } = useBottomSheet();
  return (
    <button
      onClick={() => {
        onClose();
        openSignInModal();
      }}
      className={
        "w-full text-white py-3 rounded-full mt-auto mb-2 flex items-center justify-center gap-2"
      }
      style={{
        backgroundColor: primaryColor,
      }}
    >
      <span className="font-semibold">Sign In</span>
      <img src="/tapin_icon_full_white.png" alt="Tap In Icon" className="h-5" />
    </button>
  );
};
