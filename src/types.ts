export type Cart = CartItem[];

export interface VerifyOrderPayload {
  cart: Cart;
  userDealEffect: DealEffectPayload;
  restaurant_id: string;
  userAccessToken: string | null;
  cartResults: CartResultsPayload;
  request: {
    type: string;
    content:
      | Item
      | string
      | number
      | {
          bundle_id: string | null;
          policy_id: string;
          userPreference: Item | null;
        };
  };
  jwtToken: string | null;
}

export interface VerifyOrderReturnPayload {
  payload: {
    dealEffectPayload: DealEffectPayload;
    cart: Cart;
    cartResultsPayload: CartResultsPayload;
  };
  jwtToken: string;
}

export interface JWTPayloadType {
  cart: Cart;
  dealEffectPayload: DealEffectPayload;
  cartResultsPayload: CartResultsPayload;
  user_id: string | null;
  restaurant_id: string;
}

export type CartResultsPayload = {
  discount: number;
  credit: {
    creditUsed: number;
    creditToAdd: number;
  };
  breakdown: {
    itemTotal: number;
    passTotal: number;
    bundleTotal: number;
  };
  subtotal: number;
  tax: number;
  customerServiceFee: number;
  backCharge: number;
  totalPrice: number;
  totalPoints: number;
  totalPointCost: number;
} | null;
export interface DealEffectPayload {
  addedItems: AddedItem[];
  modifiedItems: ModifiedCartItem[];
  wholeCartModification: WholeCartModification[];
}

export type WholeCartModification = {
  policy_id: string;
  bundle_id: string | null;
  type:
    | "apply_fixed_order_discount"
    | "apply_order_percent_discount"
    | "apply_order_point_multiplier"
    | "add_to_user_credit"
    | "add_to_point_cost";
  amount: number;
};

export interface ModifiedCartItem {
  id: number;
  policy_id: string;
  bundle_id: string | null;
  type: string;
  amount: number;
  quantity: number;
  maxEffectedItems: number | null;
  itemSpec: ItemSpecification[] | null;
}

export interface AddedItem {
  id: number;
  type: string;
  bundle_id: string | null;
  policy_id: string;
  item: Item;
  quantity: number;
  maxEffectedItems: number | null;
  itemSpec: ItemSpecification[];
  changedFields: {
    free?: boolean;
    percentDiscount?: number;
    fixedDiscount?: number;
    priceLimit?: number | null;
  };
}

export interface CartItem {
  id: number;
  item: Item;
  quantity: number;
  price: number;
  points: number;
  point_cost: number | 0;
}

export interface Item {
  id: string;
  variation?: string | null;
  modifiers: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  menu: Menu;
  labelMap: Record<string, string>;
  active: boolean;
  metadata: RestaurantMetadata;
  info: RestaurantInfo;
  payment_provider: "square" | "stripe";
  account_id: string;
}

interface RestaurantMetadata {
  salesTax: number;
  timeZone: string;
  locationTag: string;
  primaryColor: string;
  enableLoyaltyProgram: boolean;
  tip?: {
    enabled?: boolean;
    minimumPercentage?: number;
  };
}

interface RestaurantInfo {
  address: string;
  socials: {
    tiktokLink: string | null;
    twitterLink: string | null;
    facebookLink: string | null;
    instagramLink: string | null;
  };
  website: string;
  openingHours: OpenHours;
  contactNumber: string;
  customLinks?: {
    name: string;
    url: string;
  }[];
}

export interface PaymentPayLoad {
  totalWithTip: number;
  state: CartState;
  restaurant_id: string;
  userAccessToken: string;
  paymentData?: {
    [key: string]: unknown;
    additionalOrderData: Record<string, unknown>;
  };
  accountId: string;
}

export interface OpenHours {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export interface CreateTransactionsPayload {
  order: Order;
  transactions: Transaction[];
  policies: Record<string, string | null>;
  bundleTransactions: Transaction[];
}

export interface ReturnTransactionsPayload {
  transactions: Transaction[];
  modifiedUserData: User | null;
}

export type ItemId = string;
export type Menu = Record<ItemId, MenuItem>;
export interface MenuItem {
  info: Category | NormalItem | PassItem | BundleItem;
  path: ItemId[];
  children: ItemId[];
}

export interface Category {
  name: string;
}
export interface NormalItem {
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  sourceId?: string | null;
  archived?: boolean | null;
  variations?: Record<
    string,
    {
      sourceId: string | null;
      name: string;
      absolutePrice: number;
    }
  > | null;
}
export interface PassItem {
  name: string;
  price: number;
  for_date: string;
  description: string | null;
  amount_remaining: number | null;
  end_time: string;
}
export interface BundleItem {
  name: string;
  object: Bundle;
  bundle_policies: string[];
  price: number;
}

export interface CartState {
  cart: Cart;
  dealEffect: DealEffectPayload;
  cartResults: CartResultsPayload | null;
  errorDisplay: string | null;
  token: string | null;
}

export interface Pass {
  pass_id: string;
  restaurant_id: string;
  itemId: string;
  item_description: string | null;
  price: number;
  for_date: string;
  end_time: string;
  amount_remaining: number | null;
}

export interface Highlight {
  highlight_id: string;
  restaurant_id: string;
  content_type: "item" | "policy" | "bundle" | "media";
  content_pointer: string | null;
  title_override: string | null;
  description_override: string | null;
  active: boolean;
  end_time: string | null;
  modified_at: string;
}

export interface Transaction {
  transaction_id: string;
  created_at: string;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  restaurant_id: string;
  user_id: string;
  item: string;
  order_id: string;
  metadata: {
    modifiers?: string[];
    variation?: string | null;
    path?: string[];
    [key: string]: string | string[] | null | undefined;
  };
  tip_amount: number | null;
  price: number | null;
  tax: number | null;
}

export interface Order {
  order_id: string;
  created_at: string;
  user_id: string;
  restaurant_id: string;
  total_price: number | null;
  type: string | null;
  type_id: string | null;
  payment_intent_id: string | null;
  metadata: {
    point_cost?: number;
    points_awarded?: number;
    credit_used?: number;
    credit_to_add?: number;
    tip_amount?: number;
    tax?: number;
    discount?: number;
    service_fee?: number;
    back_charge?: number;
  };
}

export interface User {
  id: string;
  points: Record<string, number>;
  next_purchase_credit: Record<string, number>;
}

export interface UserSession {
  user: {
    id: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface Policy {
  policy_id: string;
  name: string;
  header: string | null;
  restaurant_id: string;
  count_as_deal: boolean;
  end_time: string | null;
  total_usages: number | null;
  days_since_last_use: number | null;
  locked: boolean;
  active: boolean;
  definition: PolicyDefinition;
  modified_at: string;
}

export interface Bundle {
  bundle_id: string;
  restaurant_id: string;
  duration: number;
  fixed_credit: number;
  point_multiplier: number;
  name: string;
  price: number;
  deactivated_at: string | null;
  modified_at: string;
}

export type ItemSpecification = string;

export interface PolicyDefinition {
  tag: string;
  conditions: PolicyDefinitionCondition[];
  action: PolicyDefinitionAction;
}

export type PolicyDefinitionCondition =
  | {
      type: "minimum_cart_total";
      amount: number;
    }
  | {
      type: "minimum_quantity";
      items: ItemSpecification[];
      quantity: number;
    }
  | {
      type: "minimum_user_points";
      amount: number;
    }
  | {
      type: "time_range";
      begin_time: string;
      end_time: string;
      allowed_days: string[];
    };
export type PolicyDefinitionAction =
  | {
      type: "add_item";
      items: ItemSpecification[];
      priceLimit?: number | null;
      free: boolean;
      percentDiscount: number | null;
      fixedDiscount: number | null;
      quantity: number;
    }
  | {
      type: "apply_percent_discount";
      items: ItemSpecification[];
      amount: number;
      maxEffectedItems: number;
    }
  | {
      type: "apply_fixed_discount";
      items: ItemSpecification[];
      amount: number;
      maxEffectedItems: number;
    }
  | {
      type: "apply_point_multiplier";
      items: ItemSpecification[];
      amount: number;
      maxEffectedItems: number;
    }
  | { type: "apply_order_point_multiplier"; amount: number }
  | { type: "apply_fixed_order_discount"; amount: number }
  | {
      type: "apply_blanket_price";
      amount: number;
      items: { item: ItemSpecification; quantity: number }[];
    }
  | { type: "apply_order_percent_discount"; amount: number }
  | { type: "add_to_user_credit"; amount: number };
