export type Cart = CartItem[];

export interface VerifyOrderPayload {
  cart: Cart;
  userDealEffect: DealEffectPayload;
  policy_id: string | null;
  restaurant_id: string;
  user_id: string | null;
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
  totalPrice: number;
  totalPoints: number;
  totalPointCost: number;
}

export interface DealEffectPayload {
  freeAddedItems: CartItem[];
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
  item: string;
  category?: string | null;
  liquorType?: string | null;
  liquorBrand?: string | null;
  name?: string | null;
  modifiers?: string[] | null;
}

export interface Restaurant {
  id: string;
  name: string;
  //how to do location
  menu: Menu;
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
} & Record<string, number>;

export interface DrinkMenu {
  liquor: LiquorMenu;
  beer_and_cider: DrinkCategory;
  classic_cocktail: DrinkCategory;
  specialty_option: DrinkCategory;
}

type DrinkCategory = {
  default: number;
} & Record<string, number>;

type LiquorMenu = {
  default: number;
} & Record<string, LiquorTypeMenu>;

type LiquorTypeMenu = { default: string } & Record<string, number>;

export interface Transaction {
  transaction_id: string;
  created_at: string;
  fulfilled_by: string | null;
  restaurant_id: string;
  user_id: string;
  item: string;
  category: string | null;
  deal_use_id: string | null;
  metadata: Record<string, string>;
  tip_amount: number | null;
  price: number | null;
  points_awarded: number | null;
  point_cost: number | 0;
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
  subscription_id: string | null;
  definition: PolicyDefinition;
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
  tier_tag: number;
  nightly_deal_usages: number;
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

export interface PolicyDefinition {
  id: string;
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
      items: Item[];
      quantity: number;
    }
  | {
      type: "exact_quantity";
      items: Item[];
      quantity: number;
    }
  | {
      type: "total_quantity";
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
      item: Item;
      quantity: number;
    }
  | {
      type: "apply_percent_discount";
      items: Item[];
      amount: number;
      maxEffectedItems: number;
    }
  | {
      type: "apply_fixed_discount";
      items: Item[];
      amount: number;
      maxEffectedItems: number;
    }
  | {
      type: "apply_point_multiplier";
      items: Item[];
      amount: number;
      maxEffectedItems: number;
    }
  | {
      type: "apply_point_cost";
      items: Item[];
      amount: number;
      maxEffectedItems: number;
    }
  | { type: "apply_order_point_multiplier"; amount: number }
  | { type: "apply_fixed_order_discount"; amount: number }
  | { type: "apply_blanket_price"; amount: number }
  | { type: "apply_order_percent_discount"; amount: number }
  | { type: "apply_blanket_point_cost"; amount: number };

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
