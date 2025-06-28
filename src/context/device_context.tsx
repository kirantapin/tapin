import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceNotSupported from "@/pages/device_not_supported";

interface DeviceContextType {
  isMobileDevice: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  isMobileDevice: true,
});

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  useEffect(() => {
    const checkScreenWidth = () => {
      const isMobile = window.innerWidth <= 500;
      setIsMobileDevice(isMobile);
    };

    // Check on mount
    checkScreenWidth();

    // Add resize listener
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, [navigate]);

  const value = {
    isMobileDevice,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
      {!isMobileDevice && (
        <div className="fixed inset-0 z-50 bg-white">
          <DeviceNotSupported />
        </div>
      )}
    </DeviceContext.Provider>
  );
};
