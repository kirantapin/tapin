import { DEVICE_NOT_SUPPORTED_PATH } from "@/constants";
import React, { createContext, useContext, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (!isMobile) {
      // navigate(DEVICE_NOT_SUPPORTED_PATH);
    }
  }, [navigate]);

  const value = {
    isMobileDevice: isMobile,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};
