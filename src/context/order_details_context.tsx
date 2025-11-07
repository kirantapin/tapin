import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRestaurant } from "./restaurant_context";
import { OrderDetailsInput } from "@/components/display_utils/order_details_input";

export type ServiceType = "dine_in" | "pickup";

interface OrderDetailsContextType {
  userDisplayName: string | null;
  serviceType: ServiceType;
  showNameInput: boolean;
  setServiceType: (type: ServiceType) => void;
  setShowNameInput: (
    show: boolean,
    onNameSaved?: (name: string, serviceType: ServiceType) => void
  ) => void;
}

const OrderDetailsContext = createContext<OrderDetailsContextType>({
  userDisplayName: null,
  serviceType: "pickup",
  showNameInput: false,
  setServiceType: () => {},
  setShowNameInput: () => {},
});

export const useOrderDetails = () => useContext(OrderDetailsContext);

export const OrderDetailsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [showNameInput, setShowNameInputInternal] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType>("pickup");
  const onNameSavedCallbackRef = useRef<
    ((name: string, serviceType: ServiceType) => void) | null
  >(null);
  const { restaurant } = useRestaurant();

  // Load user display name from localStorage on mount
  useEffect(() => {
    try {
      const metadata = localStorage.getItem("metadata");
      if (metadata) {
        const parsedMetadata = JSON.parse(metadata);
        if (parsedMetadata.user_display_name) {
          setUserDisplayName(parsedMetadata.user_display_name);
        }
      }
    } catch (error) {
      console.error(
        "Error reading user display name from localStorage:",
        error
      );
    }
  }, []);

  const setShowNameInput = (
    show: boolean,
    onNameSaved?: (name: string, serviceType: ServiceType) => void
  ) => {
    setShowNameInputInternal(show);
    if (show) {
      onNameSavedCallbackRef.current = onNameSaved || null;
    } else {
      onNameSavedCallbackRef.current = null;
    }
  };

  const saveName = (name: string) => {
    try {
      const existingMetadata = localStorage.getItem("metadata");
      const metadata = existingMetadata ? JSON.parse(existingMetadata) : {};
      const trimmedName = name.trim();
      metadata.user_display_name = trimmedName;
      localStorage.setItem("metadata", JSON.stringify(metadata));
      setUserDisplayName(trimmedName);
    } catch (error) {
      console.error("Error saving user display name to localStorage:", error);
    }
  };

  return (
    <OrderDetailsContext.Provider
      value={{
        userDisplayName,
        serviceType,
        showNameInput,
        setServiceType,
        setShowNameInput,
      }}
    >
      {children}
      {restaurant && (
        <OrderDetailsInput
          restaurant={restaurant}
          isOpen={showNameInput}
          onOpenChange={(open) => {
            setShowNameInputInternal(open);
            if (!open) {
              onNameSavedCallbackRef.current = null;
            }
          }}
          onNameSubmit={(name, serviceType) => {
            if (name) {
              saveName(name);
              setServiceType(serviceType);
              setShowNameInputInternal(false);
              // Prevent race conditions
              const callback = onNameSavedCallbackRef.current;
              onNameSavedCallbackRef.current = null;

              if (callback) {
                callback(name, serviceType);
              }
            } else {
              setShowNameInputInternal(false);
              onNameSavedCallbackRef.current = null;
            }
          }}
        />
      )}
    </OrderDetailsContext.Provider>
  );
};
