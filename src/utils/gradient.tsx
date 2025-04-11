import React, { RefObject, useEffect, useState } from "react";
import { adjustColor } from "./color";
import { project_url } from "./supabase_client";

export function GradientIcon({
  icon: Icon,
  primaryColor,
  size = 24,
  strokeWidth = 2,
  fromShift = -30,
  toShift = 40,
}) {
  const gradId = React.useId(); // avoids ID collisions

  return (
    <>
      {/* ➊ Define the gradient once */}
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
}

/** Returns a HEX string like "#3a6f8e" once `src` has loaded. */
export function useAverageColor(src: string | undefined) {
  const [hex, setHex] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // allow CORS images
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1; // 1 × 1 pixel is enough
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 1, 1); // browser downsamples for us
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setHex(
        `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
      );
    };
  }, [src]);

  return hex;
}

export function Hero({
  hero_image,
  profile_image,
}: {
  hero_image: string;
  profile_image: string;
}) {
  return (
    <div
      className="relative h-52 rounded-b-2xl bg-cover bg-center"
      style={{
        backgroundImage: `url(${hero_image})`,
      }}
    >
      {/* Profile Image */}
      <div className="absolute -bottom-5" style={{ left: "18px" }}>
        {" "}
        {/* Moved further down */}
        <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-lg">
          <img
            src={profile_image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export function useThemeColorOnScroll(
  colorInView: string,
  colorOutOfView = "#ffffff"
) {
  const meta = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null;
  if (!meta) return;

  // Helper to swap the meta tag
  const setTheme = (hex: string) => {
    console.log(hex);
    meta.setAttribute("content", hex);
  };
  return setTheme;
}
