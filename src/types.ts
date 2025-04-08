export type Cart = CartItem[];

export interface VerifyOrderPayload {
  cart: Cart;
  userDealEffect: DealEffectPayload;
  restaurant_id: string;
  user_id: string | null;
  request: { type: string; content: Item | string | number };
}

export interface VerifyOrderReturnPayload {
  payload: {
    dealEffectPayload: DealEffectPayload;
    cart: Cart;
    cartResultsPayload: CartResultsPayload;
  };
  jwtToken: string;
}

export interface JWTPayloadType extends Record<string, unknown> {
  cart: Cart;
  dealEffectPayload: DealEffectPayload;
  cartResultsPayload: CartResultsPayload;
  policy: Policy | null;
  user_id: string | null;
  restaurant_id: string;
}

export interface CartResultsPayload {
  subtotal: number;
  tax: number;
  totalPrice: number;
  totalPoints: number;
  totalPointCost: number;
}

export interface DealEffectPayload {
  addedItems: { policy_id: string; cartItem: CartItem }[];
  modifiedItems: ModifiedCartItem[];
  wholeCartModification: WholeCartModification | null;
}

export interface CartItem {
  id: number;
  item: Item;
  quantity: number;
  price: number;
  points: number;
  point_cost: number | 0;
}

export interface WholeCartModification {
  modificationType: string;
  amount: number;
}

export interface ModifiedCartItem {
  id: number;
  modificationType: string;
  amount: number;
  quantity: number;
}

export interface Item {
  path: string[];
  modifiers: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  //how to do location
  menu: Menu;
  stripe_account_id: string;
  active: boolean;
  metadata: Record<string, string | boolean>;
}

export interface DrinkForm {
  restaurant: Restaurant;
  onUpdate: (values: Record<string, string>) => void;
  transaction: Transaction;
}
export interface DealUse {
  deal_use_id: string;
  created_at: string;
  user_id: string;
  restaurant_id: string;
  policy_id: string;
  count_as_deal: boolean;
}

export interface CreateTransactionsPayload {
  deal_use: DealUse | null;
  transactions: Transaction[];
}

export interface ReturnTransactionsPayload {
  deal_use: DealUse | null;
  transactions: Transaction[];
  modifiedUserData: User | null;
}

export type Menu = {
  drink: DrinkMenu;
} & Record<string, Record<string, number>>;

export interface DrinkMenu {
  liquor: LiquorMenu;
  beer_and_cider: DrinkCategory;
  classic_cocktail: DrinkCategory;
  specialty_option: DrinkCategory;
}

type DrinkCategory = Record<string, number>;

type LiquorMenu = Record<string, LiquorTypeMenu>;

type LiquorTypeMenu = { house: number } & Record<string, number>;

export interface SingleMenuItem {
  price: number;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Pass {
  item_id: string;
  restaurant_id: string;
  item_name: string;
  item_description: string;
  price: number;
  for_date: string;
  end_time: string;
  amount_remaining: number | null;
}

export interface Transaction {
  transaction_id: string;
  created_at: string;
  fulfilled_by: string | null;
  restaurant_id: string;
  user_id: string;
  item: string[];
  deal_use_id: string | null;
  metadata: Record<string, string | string[]>;
  tip_amount: number | null;
  price: number | null;
  points_awarded: number | null;
  point_cost: number | 0;
  payment_intent_id: string;
}

export interface User {
  id: string;
  signed_up: string;
  points: Record<string, number>;
}

export interface UserSession {
  phone: string;
  accessToken: string;
  refreshToken: string;
}

export interface Policy {
  policy_id: string;
  name: string;
  header: string | null;
  restaurant_id: string;
  count_as_deal: boolean;
  begin_time: string | null;
  end_time: string | null;
  total_usages: number | null;
  days_since_last_use: number | null;
  subscription_id: string | null;
  definition: PolicyDefinition;
  image_url: string | null;
}
export interface UserSubscription {
  user_id: string;
  restaurant_id: string;
  subscription_id: string;
  last_paid: string;
  created_at: string;
}

export interface Subscription {
  subscription_id: string;
  restaurant_id: string;
  display_name: string;
  display_description: string;
  display_perk_list: string[];
  price: number;
  added_nightly_deal_usages: number;
}
export interface Package {
  package_id: string;
  restaurant_id: string;
  display_name: string;
  display_description: string;
  display_perk_list: string[];
  price: number;
  nightly_deal_usages: number;
  begin_time: string;
  end_time: string;
}

export type ItemSpecification = string[];

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
      type: "add_free_item";
      item: ItemSpecification;
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
  | {
      type: "apply_point_cost";
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
  | {
      type: "apply_add_on";
      items: ItemSpecification[];
      amount: number;
      frequency: number;
    };

export interface HouseMixerTemplate {
  name: string;
  modifiers: string[];
  liquorType: string;
  liquorBrand: string;
  quantity: number;
}

export interface ShotShooterTemplate {
  modifiers: string[];
  liquorType: string;
  liquorBrand: string;
  quantity: number;
}
