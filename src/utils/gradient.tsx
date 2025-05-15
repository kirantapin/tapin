import React from "react";
import { adjustColor } from "./color";

interface GradientIconProps {
  icon: React.ElementType;
  primaryColor: string;
  size?: number;
  strokeWidth?: number;
  fromShift?: number;
  toShift?: number;
}

export const GradientIcon: React.FC<GradientIconProps> = ({
  icon: Icon,
  primaryColor,
  size = 24,
  strokeWidth = 2,
  fromShift = -30,
  toShift = 40,
}) => {
  const gradId = React.useId(); // avoids ID collisions

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2={size}
            y2={size}
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={adjustColor(primaryColor, fromShift)}
            />
            <stop
              offset="100%"
              stopColor={adjustColor(primaryColor, toShift)}
            />
          </linearGradient>
        </defs>
      </svg>

      {/* ➋ Render the Lucide icon with the gradient stroke */}
      <Icon size={size} stroke={`url(#${gradId})`} strokeWidth={strokeWidth} />
    </>
  );
};
