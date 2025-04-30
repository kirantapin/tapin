import { useAuth } from "@/context/auth_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";

interface SignInButtonProps {
  onClose: () => void;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  onClose = () => {},
}) => {
  const { openSignInModal } = useBottomSheet();
  return (
    <button
      onClick={() => {
        onClose();
        openSignInModal();
      }}
      className={
        "w-full mx-1 bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-white py-3 rounded-full mt-auto mb-2 flex items-center justify-center gap-2"
      }
    >
      <span className="font-semibold">Sign In</span>
      <img src="/tapin_icon_full_white.png" alt="Tap In Icon" className="h-5" />
    </button>
  );
};
