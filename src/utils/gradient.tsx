import React, { RefObject, useEffect, useState } from "react";
import { adjustColor } from "./color";
import { project_url } from "./supabase_client";
import {
  DRINK_CHECKOUT_PATH,
  MY_SPOT_PATH,
  RESTAURANT_IMAGE_BUCKET,
} from "@/constants";
import { User } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Menu } from "lucide-react";
import { useRestaurant } from "@/context/restaurant_context";
import { useAuth } from "@/context/auth_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useNavigate } from "react-router-dom";

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

export function Hero({
  restaurant_id,
  setSidebarOpen,
}: {
  restaurant_id: string;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { openProfileModal } = useBottomSheet();
  const navigate = useNavigate();

  const buttonBackgroundColor = "white";
  const buttonColor = "black";
  return (
    <div
      className="relative h-52 rounded-b-2xl bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${project_url}/storage/v1/object/public/${RESTAURANT_IMAGE_BUCKET}/${restaurant_id}_hero.jpeg)`,
      }}
    >
      <div className="absolute w-full top-0 z-10 flex justify-between items-center px-4 py-3">
        <div
          className=" p-2 rounded-full"
          style={{ backgroundColor: buttonColor }}
          onClick={() => {
            setSidebarOpen(true);
          }}
        >
          <Menu className="w-5 h-5" style={{ color: buttonBackgroundColor }} />
        </div>

        {/* Shopping Bag & User Icons */}
        <div className="flex items-center gap-5">
          <div
            className=" p-2 rounded-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => {
              navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant_id));
            }}
          >
            <ShoppingBag
              className="w-5 h-5"
              style={{ color: buttonBackgroundColor }}
            />
          </div>
          <div
            className=" p-2 rounded-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => {
              openProfileModal();
            }}
          >
            <User
              className="w-5 h-5"
              style={{ color: buttonBackgroundColor }}
            />
          </div>
        </div>
      </div>
      {/* Profile Image */}
      <div className="absolute -bottom-5" style={{ left: "18px" }}>
        {/* Moved further down */}
        <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-2xl">
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
