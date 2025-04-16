import { useAuth } from "@/context/auth_context";

interface SignInButtonProps {
  onClose: () => void;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  onClose = () => {},
}) => {
  const { setShowSignInModal } = useAuth();
  return (
    <button
      onClick={() => {
        onClose();
        setShowSignInModal(true);
      }}
      className={
        "w-full mx-1 bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-white py-3 rounded-full mt-auto mb-2"
      }
    >
      Sign In
    </button>
  );
};
