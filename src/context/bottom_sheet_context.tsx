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
} from "@/types";
import { Bundle } from "@/types";
import { useRestaurant } from "./restaurant_context";
import { useGlobalCartManager } from "@/hooks/useGlobalCartManager";
import { useAuth } from "./auth_context";
import BundleModal from "@/components/bottom_sheets/bundle_modal";
import { BundleUtils } from "@/utils/bundle_utils";
import { emptyDealEffect, MAX_QR_TRANSACTIONS } from "@/constants";
import { ItemUtils } from "@/utils/item_utils";
import { CartManager } from "@/utils/cartManager";
import ProfileModal from "@/components/bottom_sheets/profile_modal";
import SignInModal from "@/components/bottom_sheets/signin_modal";
import LockedPolicyModal from "@/components/bottom_sheets/locked_policy_modal";
import AllBundlesModal from "@/components/bottom_sheets/all_bundles_modal";
import CheckoutModal from "@/components/bottom_sheets/checkout_modal";
import { TransactionUtils } from "@/utils/transaction_utils";
import ItemModModal from "@/components/bottom_sheets/item_mod_modal";
import SelfRedeemModal from "@/components/bottom_sheets/self_redeem_modal";

// Define the shape of your sheet registry: keys → sheet components
type SheetMap = Record<string, FC<any>>;

interface BottomSheetContextValue {
  openBundleModal: (bundle: Bundle) => void;
  closeSheet: () => void;
  openQrModal: (transactionsToRedeem: Transaction[]) => void;
  handlePolicyClick: (
    policy: Policy,
    userOwnershipMap: Record<string, string | null>
  ) => void;
  state: CartState;
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: Item | null
  ) => Promise<void>;
  addToCart: (item: Item, showToast?: boolean) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  removePolicy: (policy_id: string) => Promise<void>;
  refreshCart: () => Promise<string | null>;
  clearCart: () => void;
  getActivePolicies: () => string[];
  cartManager: CartManager | null;
  openSignInModal: () => void;
  openProfileModal: () => void;
  triggerToast: (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => void;
  openAllBundlesModal: () => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  openItemModModal: (
    itemId: string,
    onSelect: (item: Item) => Promise<void>
  ) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue>({
  openBundleModal: () => {},
  closeSheet: () => {},
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
  triggerToast: () => {},
  openAllBundlesModal: () => {},
  openCheckoutModal: () => {},
  closeCheckoutModal: () => {},
  openItemModModal: () => {},
});

interface BottomSheetProviderProps {
  sheets: SheetMap;
  children: ReactNode;
}

const validateTransactions = (
  transactions: Transaction[],
  triggerToast: (
    message: string,
    type: "error" | "success" | "info",
    duration?: number
  ) => void,
  restaurant: Restaurant | null
): boolean => {
  if (transactions.length <= 0 || !restaurant) {
    return false;
  }
  if (transactions.length > MAX_QR_TRANSACTIONS) {
    triggerToast(
      "Please try to redeem again with a fewer number of items.",
      "error"
    );
    return false;
  }

  // Check if all transactions are from the same restaurant and unfulfilled
  const allSameRestaurant = transactions.every(
    (transaction) => transaction.restaurant_id === transactions[0].restaurant_id
  );
  const allUnfulfilled = transactions.every(
    (transaction) => transaction.fulfilled_by === null
  );

  const allRedeemable = transactions.every((transaction) =>
    TransactionUtils.isTransactionRedeemable(transaction, restaurant)
  );

  if (!allSameRestaurant || !allUnfulfilled || !allRedeemable) {
    triggerToast("Something went wrong. Please try again.", "error");
    return false;
  }
  return true;
};

export const BottomSheetProvider: FC<BottomSheetProviderProps> = ({
  children,
}) => {
  const { restaurant } = useRestaurant();
  const { userSession } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [bundleModal, setBundleModal] = useState<Bundle | null>(null);
  const [policyModal, setPolicyModal] = useState<{
    policy: Policy;
    bundle_id: string | null;
    userPreference?: Item;
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showItemModModal, setShowItemModModal] = useState<{
    open: boolean;
    itemId: string;
    onSelect: (item: Item) => Promise<void>;
  } | null>(null);

  const openItemModModal = (
    itemId: string,
    onSelect: (item: Item) => Promise<void>
  ) => {
    setShowItemModModal({ open: true, itemId, onSelect });
  };

  const closeItemModModal = () => {
    setShowItemModModal((prev) => {
      if (prev) {
        return { open: false, itemId: prev.itemId, onSelect: prev.onSelect };
      }
      return null;
    });
    setTimeout(() => {
      setShowItemModModal(null);
    }, 200);
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
      setShowItemModModal(null);
    }, 200);
  };

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
  } = useGlobalCartManager(
    restaurant as Restaurant,
    userSession,
    true,
    openItemModModal
  );

  const handlePolicyClick = (
    policy: Policy,
    userOwnershipMap: Record<string, string | null>
  ) => {
    if (!restaurant) {
      return;
    }
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
        if (BundleUtils.isBundlePurchaseable(bundleObject)) {
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
    const valid = validateTransactions(
      transactionsToRedeem,
      triggerToast,
      restaurant
    );
    if (!valid) {
      return;
    }
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
  const openCheckoutModal = () => {
    if (isOpen) {
      closeSheet();
    }
    setTimeout(() => {
      setShowCheckoutModal(true);
      setIsOpen(true);
    }, 200); // Wait for animation to complete
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
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

  return (
    <BottomSheetContext.Provider
      value={{
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
        openCheckoutModal,
        closeCheckoutModal,
        openItemModModal,
      }}
    >
      {children}
      {policyModal && (
        <PolicyModal
          isOpen={isOpen}
          onClose={closeSheet}
          policy={policyModal.policy}
          restaurant={restaurant as Restaurant}
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

      {showItemModModal && (
        <ItemModModal
          isOpen={showItemModModal.open}
          onClose={closeItemModModal}
          itemId={showItemModModal.itemId}
          onSelect={showItemModModal.onSelect}
        />
      )}

      {qrModal && (
        <SelfRedeemModal
          isOpen={isOpen}
          onClose={closeSheet}
          transactionsToRedeem={qrModal?.transactionsToRedeem || []}
          restaurant={restaurant as Restaurant}
        />
      )}

      <SignInModal isOpen={showSignInModal} onClose={closeSheet} />

      <ProfileModal isOpen={showProfile} onClose={closeSheet} />
      <AllBundlesModal isOpen={showAllBundlesModal} onClose={closeSheet} />
      <CheckoutModal isOpen={showCheckoutModal} onClose={closeSheet} />
    </BottomSheetContext.Provider>
  );
};

// hook for pages/components
export const useBottomSheet = () => useContext(BottomSheetContext);
