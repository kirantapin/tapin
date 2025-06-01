import { ChevronDown } from "lucide-react";

function ScrollDownIndicator({
  scrollTarget,
  primaryColor,
  size = "w-6 h-6",
}: {
  scrollTarget: React.RefObject<HTMLDivElement>;
  primaryColor: string;
  size?: string;
}) {
  const scrollToBottom = () => {
    if (scrollTarget.current) {
      scrollTarget.current.scrollTo({
        top: scrollTarget.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <ChevronDown
        className={`${size} animate-bounce-slow cursor-pointer`}
        style={{ color: primaryColor }}
        onClick={scrollToBottom}
      />
    </div>
  );
}

export default ScrollDownIndicator;
