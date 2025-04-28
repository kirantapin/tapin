import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from "react";
import PolicyModal from "@/components/bottom_sheets/policy_modal";
import {
  BundleItem,
  Policy,
  Restaurant,
  Transaction,
  UserSession,
} from "@/types";
import { Bundle } from "@/types";
import { useRestaurant } from "./restaurant_context";
import { useGlobalCartManager } from "@/hooks/useGlobalCartManager";
import { useAuth } from "./auth_context";
import BundleModal from "@/components/bottom_sheets/bundle_modal";
import QRModal from "@/components/bottom_sheets/qr_modal";
import { BundleUtils } from "@/utils/bundle_utils";
import { toast } from "react-toastify";
import { MY_SPOT_PATH } from "@/constants";
import { ItemUtils } from "@/utils/item_utils";

// Define the shape of your sheet registry: keys → sheet components
type SheetMap = Record<string, FC<any>>;

interface BottomSheetContextValue {
  openPolicyModal: (policy: Policy, bundle_id: string | null) => void;
  openBundleModal: (bundle: Bundle) => void;
  closeSheet: () => void;
  bundleModal: Bundle | null;
  policyModal: { policy: Policy; bundle_id: string | null } | null;
  isOpen: boolean;
  openQrModal: (transactionsToRedeem: Transaction[]) => void;
  handlePolicyClick: (
    policy: Policy,
    userOwnershipMap: Record<string, boolean>
  ) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue>({
  openPolicyModal: () => {},
  openBundleModal: () => {},
  closeSheet: () => {},
  bundleModal: null,
  policyModal: null,
  isOpen: false,
  openQrModal: () => {},
  handlePolicyClick: () => {},
});

interface BottomSheetProviderProps {
  sheets: SheetMap;
  children: ReactNode;
}

export const BottomSheetProvider: FC<BottomSheetProviderProps> = ({
  children,
}) => {
  const { restaurant } = useRestaurant();
  const { userSession } = useAuth();
  const { addToCart, removeFromCart, state, addPolicy } = useGlobalCartManager(
    restaurant as Restaurant,
    userSession
  );
  const [isOpen, setIsOpen] = useState(false);
  const [bundleModal, setBundleModal] = useState<Bundle | null>(null);
  const [policyModal, setPolicyModal] = useState<{
    policy: Policy;
    bundle_id: string | null;
  } | null>(null);
  const [qrModal, setQrModal] = useState<{
    transactionsToRedeem: Transaction[];
  } | null>(null);

  const handlePolicyClick = (
    policy: Policy,
    userOwnershipMap: Record<string, boolean>
  ) => {
    if (policy.locked) {
      //we're deal with a potential bundle here
      const relevantBundleIds = BundleUtils.getBundleIdFromChildPolicyId(
        policy.policy_id,
        restaurant
      );
      if (relevantBundleIds.length === 0) {
        toast.error("This deal does not belong to any existing Bundles");
        return;
      }
      for (const bundleId of relevantBundleIds) {
        if (userOwnershipMap[bundleId]) {
          openPolicyModal(policy, bundleId);
          return;
        }
      }
      for (const bundleId of relevantBundleIds) {
        const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
          bundleId,
          restaurant
        ) as BundleItem;
        const bundleObject = bundleMenuItem.object;
        if (bundleObject.deactivated_at === null) {
          openBundleModal(bundleObject);
          return;
        }
      }
      toast.error("You do not own any of the bundles for this deal");
    } else {
      openPolicyModal(policy, null);
    }
  };

  const openPolicyModal = (policy: Policy, bundle_id: string | null) => {
    if (isOpen) {
      closeSheet();
    }
    setPolicyModal({ policy, bundle_id });
    setIsOpen(true);
  };

  const openBundleModal = (bundle: Bundle) => {
    if (isOpen) {
      closeSheet();
    }
    setBundleModal(bundle);
    setIsOpen(true);
  };

  const openQrModal = (transactionsToRedeem: Transaction[]) => {
    if (isOpen) {
      closeSheet();
    }
    setQrModal({ transactionsToRedeem });
    setIsOpen(true);
  };
  const closeSheet = () => {
    setIsOpen(false);
    setTimeout(() => {
      setBundleModal(null);
      setPolicyModal(null);
    }, 300); // Wait for animation to complete
  };

  return (
    <BottomSheetContext.Provider
      value={{
        openPolicyModal,
        openBundleModal,
        closeSheet,
        openQrModal,
        handlePolicyClick,
      }}
    >
      {children}
      {policyModal && (
        <PolicyModal
          isOpen={isOpen}
          onClose={closeSheet}
          policy={policyModal.policy}
          restaurant={restaurant as Restaurant}
          addPolicy={addPolicy}
          state={state}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          bundle_id={policyModal.bundle_id}
        />
      )}
      {bundleModal && (
        <BundleModal
          isOpen={isOpen}
          onClose={closeSheet}
          bundle={bundleModal}
          restaurant={restaurant as Restaurant}
        />
      )}
      {qrModal && (
        <QRModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          transactionsToRedeem={qrModal.transactionsToRedeem}
          restaurant={restaurant as Restaurant}
        />
      )}
    </BottomSheetContext.Provider>
  );
};

// hook for pages/components
export const useBottomSheet = () => useContext(BottomSheetContext);
