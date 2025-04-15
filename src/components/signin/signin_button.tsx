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
        "w-[calc(100%-48px)] mx-6 bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-white py-3 rounded-full fixed bottom-6 left-0 right-0"
      }
    >
      Sign In
    </button>
  );
};
