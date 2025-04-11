import { useEffect, useRef, useState } from "react";

export const useBannerColor = (
  titleRef: React.RefObject<HTMLHeadingElement>
) => {
  const [lastScrollY, setLastScrollY] = useState(0);
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
      const meta = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement | null;
      if (!meta || !titleRef.current) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const currentScrollY = window.scrollY;

          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smooth transition
            meta.setAttribute("content", "#000000");
          } else {
            meta.setAttribute("content", "#ffffff");
          }

          setLastScrollY(currentScrollY);
        },
        {
          threshold: 0,
          rootMargin: "0px",
        }
      );

      observerRef.current.observe(titleRef.current);
    };

    createObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clean up the style
      document.head.removeChild(style);
    };
  }, [lastScrollY, titleRef.current]);
};
