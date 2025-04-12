import React, { RefObject, useEffect, useState } from "react";
import { adjustColor } from "./color";
import { project_url } from "./supabase_client";
import { RESTAURANT_IMAGE_BUCKET } from "@/constants";

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

export function Hero({ restaurant_id }: { restaurant_id: string }) {
  return (
    <div
      className="relative h-52 rounded-b-2xl  bg-cover bg-center"
      style={{
        backgroundImage: `url(${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant_id}_hero.jpeg)`,
      }}
    >
      {/* Profile Image */}
      <div className="absolute -bottom-5" style={{ left: "18px" }}>
        {" "}
        {/* Moved further down */}
        <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-xl">
          <img
            src={`${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant_id}_profile.png`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
