import React from "react";

interface CustomIconProps {
  circleColor: string;
  size?: number;
}

const CustomIcon: React.FC<CustomIconProps> = ({ circleColor, size = 84 }) => {
  return (
    <svg
      width={size}
      height={(size * 85) / 84} // maintain aspect ratio
      viewBox="0 0 84 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle – customizable color */}
      <path
        d="M69.3056 29.2633C77.3245 29.2633 83.8252 22.7125 83.8252 14.6317C83.8252 6.55082 77.3245 0 69.3056 0C61.2867 0 54.7861 6.55082 54.7861 14.6317C54.7861 22.7125 61.2867 29.2633 69.3056 29.2633Z"
        fill={circleColor}
      />
      {/* Other paths – solid black */}
      <path d="M48.32 36.2534V11.9067H0V36.2534H48.32Z" fill="black" />
      <path
        d="M48.32 60.6C34.9761 60.6 24.16 71.4997 24.16 84.9466H0V84.295C0.352701 57.8158 21.6323 36.4311 47.9673 36.2534H72.4212V84.9466H48.32V60.6Z"
        fill="black"
      />
    </svg>
  );
};

export default CustomIcon;
