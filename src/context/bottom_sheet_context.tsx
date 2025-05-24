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
  CartState,
  Item,
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
import { emptyDealEffect } from "@/constants";
import { ItemUtils } from "@/utils/item_utils";
import { CartManager } from "@/utils/cartManager";
import ProfileModal from "@/components/bottom_sheets/profile_modal";
import SignInModal from "@/components/bottom_sheets/signin_modal";
import LockedPolicyModal from "@/components/bottom_sheets/locked_policy_modal";
import AllBundlesModal from "@/components/bottom_sheets/all_bundles_modal";
import LiquorFormModal from "@/components/bottom_sheets/liquor_form_modal";

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
    userOwnershipMap: Record<string, string | null>
  ) => void;
  state: CartState;
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: string | null
  ) => Promise<void>;
  addToCart: (item: Item, showToast?: boolean) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  removePolicy: (policy_id: string) => Promise<void>;
  refreshCart: () => Promise<string | null>;
  clearCart: () => void;
  getActivePolicies: () => string[];
  cartManager: CartManager;
  openSignInModal: () => void;
  openProfileModal: () => void;
  openLockedPolicyModal: (policy: Policy) => void;
  triggerToast: (message: string, type: "success" | "error" | "info") => void;
  openAllBundlesModal: () => void;
  openLiquorFormModal: (type: string) => void;
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
  state: {
    cart: [],
    dealEffect: emptyDealEffect,
    cartResults: null,
    errorDisplay: null,
    token: null,
  },
  addPolicy: () => Promise.resolve(),
  addToCart: () => Promise.resolve(),
  removeFromCart: () => Promise.resolve(),
  removePolicy: () => Promise.resolve(),
  refreshCart: () => Promise.resolve(null),
  clearCart: () => {},
  getActivePolicies: () => [],
  cartManager: null,
  openSignInModal: () => {},
  openProfileModal: () => {},
  openLockedPolicyModal: () => {},
  triggerToast: () => {},
  openAllBundlesModal: () => {},
  openLiquorFormModal: (type: string) => {},
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
  const {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    addPolicy,
    removePolicy,
    refreshCart,
    clearCart,
    getActivePolicies,
    cartManager,
    triggerToast,
  } = useGlobalCartManager(restaurant as Restaurant, userSession);
  const [isOpen, setIsOpen] = useState(false);
  const [bundleModal, setBundleModal] = useState<Bundle | null>(null);
  const [policyModal, setPolicyModal] = useState<{
    policy: Policy;
    bundle_id: string | null;
  } | null>(null);
  const [qrModal, setQrModal] = useState<{
    transactionsToRedeem: Transaction[];
  } | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lockedPolicyModal, setLockedPolicyModal] = useState<{
    policy: Policy;
    bundle_id: string;
  } | null>(null);
  const [showAllBundlesModal, setShowAllBundlesModal] = useState(false);
  const [showLiquorFormModal, setShowLiquorFormModal] = useState<{
    type: string;
  } | null>(null);

  const handlePolicyClick = (
    policy: Policy,
    userOwnershipMap: Record<string, string | null>
  ) => {
    if (policy.locked) {
      //we're deal with a potential bundle here
      const relevantBundleIds = BundleUtils.getBundleIdFromChildPolicyId(
        policy.policy_id,
        restaurant
      );
      if (relevantBundleIds.length === 0) {
        triggerToast(
          "This deal does not belong to any existing Bundles",
          "error"
        );
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
          openLockedPolicyModal(policy, bundleId);
          return;
        }
      }
      triggerToast("You do not own any of the bundles for this deal", "error");
    } else {
      openPolicyModal(policy, null);
    }
  };

  const openPolicyModal = (policy: Policy, bundle_id: string | null) => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setPolicyModal({ policy, bundle_id });
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openBundleModal = (bundle: Bundle) => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setBundleModal(bundle);
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openQrModal = (transactionsToRedeem: Transaction[]) => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setQrModal({ transactionsToRedeem });
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openSignInModal = () => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setShowSignInModal(true);
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openProfileModal = () => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setShowProfile(true);
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openLiquorFormModal = (type: string) => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setShowLiquorFormModal({ type });
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const openAllBundlesModal = () => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setShowAllBundlesModal(true);
      setIsOpen(true);
    }, 200);
  };

  const openLockedPolicyModal = (policy: Policy, bundle_id: string) => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setLockedPolicyModal({ policy, bundle_id });
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const closeSheet = () => {
    setIsOpen(false);
    setTimeout(() => {
      setBundleModal(null);
      setPolicyModal(null);
      setQrModal(null);
      setShowSignInModal(false);
      setShowProfile(false);
      setLockedPolicyModal(null);
      setShowAllBundlesModal(false);
      setShowLiquorFormModal(false);
    }, 200);
  };

  return (
    <BottomSheetContext.Provider
      value={{
        openPolicyModal,
        openBundleModal,
        closeSheet,
        openQrModal,
        handlePolicyClick,
        state,
        addPolicy,
        addToCart,
        removeFromCart,
        removePolicy,
        refreshCart,
        clearCart,
        getActivePolicies,
        cartManager,
        openSignInModal,
        openProfileModal,
        triggerToast,
        openAllBundlesModal,
        openLiquorFormModal,
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

      {lockedPolicyModal && (
        <LockedPolicyModal
          isOpen={isOpen}
          onClose={closeSheet}
          policy={lockedPolicyModal.policy}
          bundle_id={lockedPolicyModal.bundle_id}
        />
      )}

      {qrModal && (
        <QRModal
          isOpen={isOpen}
          onClose={closeSheet}
          transactionsToRedeem={qrModal?.transactionsToRedeem || []}
          restaurant={restaurant as Restaurant}
        />
      )}

      <SignInModal isOpen={showSignInModal} onClose={closeSheet} />

      <ProfileModal isOpen={showProfile} onClose={closeSheet} />
      <AllBundlesModal isOpen={showAllBundlesModal} onClose={closeSheet} />
      {showLiquorFormModal && (
        <LiquorFormModal
          isOpen={isOpen}
          onClose={closeSheet}
          type={showLiquorFormModal.type}
        />
      )}
    </BottomSheetContext.Provider>
  );
};

// hook for pages/components
export const useBottomSheet = () => useContext(BottomSheetContext);
