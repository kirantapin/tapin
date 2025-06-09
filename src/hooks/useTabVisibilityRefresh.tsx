import { useEffect, useRef } from "react";

export function useTabVisibilityRefresh(
  callback: () => Promise<void>,
  debounceMs = 15000
) {
  const lastCheckedRef = useRef<number>(0);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const now = Date.now();
      const oldTime = lastCheckedRef.current;
      lastCheckedRef.current = now;
      if (now - oldTime < debounceMs) {
        return;
      }

      if (document.visibilityState === "visible") {
        await callback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [callback, debounceMs]);
}
