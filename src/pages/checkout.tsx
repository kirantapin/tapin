import { useEffect, useState, useRef } from "react";
import { X, Tag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth_context";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { Policy, Restaurant, Transaction } from "@/types";
import { titleCase } from "title-case";
import { ItemUtils } from "@/utils/item_utils";
import { PolicyUtils } from "@/utils/policy_utils";
import AccessCardSlider from "@/components/sliders/access_card_slider";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card";
import CheckoutSummary from "@/components/checkout/checkout_summary";
import AddOnManager from "@/components/sliders/add_on_manager";
import SpendGoalCard from "@/components/cards/spend_goal_card";
import DealPreOrderBar from "@/components/checkout/deal_checkout_bar";
import { PolicyCard } from "@/components/cards/policy_card";
import { Alert } from "@/components/display_utils/alert";
import { SignInButton } from "@/components/signin/signin_button";
import PayButton from "@/components/buttons/pay_button";
import BundleCTA from "@/components/checkout/bundle_cta";
import {
  ADD_ON_TAG,
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
  OFFERS_PAGE_PATH,
  RESTAURANT_PATH,
} from "@/constants";
import HighlightSlider from "@/components/sliders/highlight_slider";
import ScrollDownIndicator from "@/components/buttons/scroll_down_indicator";
import { TransactionUtils } from "@/utils/transaction_utils";
import { OpeningHoursWarning } from "@/components/display_utils/opening_hours_warning";

export default function CheckoutPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { userSession } = useAuth();
  const { restaurant, policyManager } = useRestaurant();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    addPolicy,
    addToCart,
    removeFromCart,
    refreshCart,
    removePolicy,
    clearCart,
    closeCheckoutModal,
  } = useBottomSheet();

  const [tipAmount, setTipAmount] = useState<number>(0);
  const [inlineRecommendation, setInlineRecommendation] = useState<{
    cartId: number;
    flair: string;
    policy: Policy;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const activePolicy =
      policyManager
        ?.getActivePolicies(state.dealEffect)
        .find((p) => p.definition.tag === NORMAL_DEAL_TAG) || null;

    if (activePolicy) {
      setInlineRecommendation(null);
    } else if (state.cart.length > 0 && !inlineRecommendation) {
      const rec = policyManager?.getInlineRecommendations(
        state.cart,
        state.dealEffect,
        restaurant as Restaurant
      );
      if (rec) setInlineRecommendation(rec);
    }
  }, [state.cart, policyManager, state.dealEffect]);

  if (!restaurant || !policyManager || !state) {
    return null;
  }

  const isPreEntry = state.cart.some((item) =>
    ItemUtils.isPassItem(item.item.id, restaurant)
  );

  return (
    <div className="flex flex-col grow min-h-0 overflow-x-hidden touch-pan-y">
      {/* Header */}
      <div className="flex-none bg-white border-b z-50">
        <div className="px-6 pt-4 pb-4">
          <div className="flex items-center">
            <div className="absolute left-4">
              <button
                className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none"
                onClick={closeCheckoutModal}
              >
                <X size={20} />
              </button>
            </div>
            <h6 className="flex-1 text-lg font-semibold text-center">
              Checkout
            </h6>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="px-4 pb-8">
          <OpeningHoursWarning context="checkout" marginTop={20} />
          <AccessCardSlider
            restaurant={restaurant}
            cart={state.cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            displayCartPasses
            dealEffect={state.dealEffect}
            inlineRecommendation={inlineRecommendation}
          />

          {state.cart.length > 0 ? (
            <div className="mt-4">
              {state.cart
                .filter(
                  (item) => !ItemUtils.isPassItem(item.item.id, restaurant)
                )
                .map((item) => (
                  <CheckoutItemCard
                    key={item.id}
                    item={item}
                    restaurant={restaurant}
                    dealEffect={state.dealEffect}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    inlineRecommendation={inlineRecommendation}
                  />
                ))}
            </div>
          ) : (
            <div className="flex justify-center mt-12">
              <div className="text-black text-xl font-bold">
                There are no items in your cart.
              </div>
            </div>
          )}

          {/* Active Deals */}
          <div className="flex flex-wrap gap-2 mt-4">
            {policyManager
              .getActivePolicies(state.dealEffect)
              .filter((p) => p.definition.tag !== ADD_ON_TAG)
              .map((policy) => (
                <Alert
                  key={policy.policy_id}
                  trigger={
                    <button className="px-2 py-2 bg-gray-100 rounded-full text-xs flex items-center gap-1">
                      <Tag size={13} className="text-gray-800" />
                      <span className="text-gray-800 text-md font-semibold">
                        {titleCase(
                          PolicyUtils.getPolicyName(policy, restaurant)
                        )}
                      </span>
                      <X className="text-gray-800 h-4 w-4" />
                    </button>
                  }
                  title="Are you sure?"
                  description="You're about to remove a deal from your cart."
                  onConfirm={() => removePolicy(policy.policy_id)}
                  confirmLabel="Remove"
                  cancelLabel="Keep Deal"
                />
              ))}
          </div>

          <AddOnManager
            state={state}
            isPreEntry={isPreEntry}
            addPolicy={addPolicy}
            removePolicy={removePolicy}
          />

          {/* Recommended Deals */}
          {policyManager.getRecommendedDeals(
            state.cart,
            state.dealEffect,
            restaurant
          ).length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Save More</h2>
                <ScrollDownIndicator
                  scrollTarget={scrollContainerRef}
                  primaryColor={restaurant.metadata.primaryColor}
                  size="w-8 h-8"
                />
              </div>
              <div className="overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                <div className="flex gap-6 snap-x snap-mandatory">
                  {policyManager
                    .getRecommendedDeals(
                      state.cart,
                      state.dealEffect,
                      restaurant
                    )
                    .slice(0, 3)
                    .map((policy) => (
                      <div
                        key={policy.policy_id}
                        className="w-[90%] flex-shrink-0 snap-center"
                      >
                        <PolicyCard
                          cart={state.cart}
                          policy={policy}
                          restaurant={restaurant}
                          dealEffect={state.dealEffect}
                          extraTags={
                            PolicyUtils.isPolicyUsable(policy, restaurant)
                              ? []
                              : ["Not Currently Active"]
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          <div className="mt-4">
            <SpendGoalCard
              onClick={() => {
                closeCheckoutModal();
                navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
                  state: { tag: LOYALTY_REWARD_TAG },
                });
              }}
            />
          </div>

          <h2 className="text-2xl font-bold mt-6">Payment</h2>

          <DealPreOrderBar
            policy={
              policyManager
                .getActivePolicies(state.dealEffect)
                .find((p) => p.definition.tag === NORMAL_DEAL_TAG) || null
            }
            restaurant={restaurant}
          />

          <CheckoutSummary
            state={state}
            restaurant={restaurant}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            showDiscount={true}
            showTipSelection={true}
          />

          <div className="bg-white pt-0 -mx-4 px-4 shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.1)]">
            <BundleCTA />
            {state.cart.length > 0 && (
              <div className="mt-4">
                {userSession && state.token && state.cartResults ? (
                  <PayButton
                    paymentProvider={restaurant.payment_provider}
                    payload={{
                      userAccessToken: userSession.access_token,
                      restaurant_id: restaurant.id,
                      state,
                      totalWithTip: Math.round(
                        (state.cartResults.totalPrice + tipAmount) * 100
                      ),
                      accountId: restaurant.account_id,
                    }}
                    refresh={refreshCart}
                    postPurchase={async (transactions: Transaction[]) => {
                      await clearCart();
                      closeCheckoutModal();
                      const targetPath = RESTAURANT_PATH.replace(
                        ":id",
                        restaurant.id
                      );

                      const redeemableTransactions = transactions.filter(
                        (transaction) =>
                          TransactionUtils.isTransactionRedeemable(
                            transaction,
                            restaurant
                          )
                      );

                      const postReloadState = {
                        qr: true,
                        transactions: redeemableTransactions,
                        message: {
                          type: "success",
                          message:
                            "Purchase successful! You can redeem your items anytime in My Spot",
                        },
                      };

                      sessionStorage.setItem(
                        "postReloadState",
                        JSON.stringify(postReloadState)
                      );

                      if (location.pathname === targetPath) {
                        window.location.reload();
                      } else {
                        navigate(targetPath);
                      }
                    }}
                  />
                ) : (
                  <SignInButton
                    onClose={() => {}}
                    primaryColor={restaurant.metadata.primaryColor}
                  />
                )}
              </div>
            )}
            <HighlightSlider displayOne={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
