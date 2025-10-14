import { Restaurant } from "@/types";
import { setThemeColor } from "@/utils/color";
import { useEffect, useRef } from "react";

export const useBannerColor = (
  titleElement: HTMLHeadingElement | null,
  restaurant: Restaurant | null | undefined
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    // First, add a transition style to the meta theme-color
    const style = document.createElement("style");
    style.innerHTML = `
      meta[name="theme-color"] {
        transition: content 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    const createObserver = () => {
      if (!titleElement || !restaurant) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smooth transition
            setThemeColor("#000000");
          } else {
            setThemeColor("#ffffff");
          }
        },
        {
          threshold: 0,
          rootMargin: "0px",
        }
      );

      if (titleElement && restaurant) {
        observerRef.current.observe(titleElement);
      }
    };

    createObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clean up the style
      document.head.removeChild(style);
    };
  }, [titleElement, restaurant]);
};
