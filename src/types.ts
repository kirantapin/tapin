export type Cart = CartItem[];

export interface DealEffectPayload {
  freeAddedItems: { item: Item; quantity: number }[];
  modifiedItems: ModifiedCartItem[];
  wholeCartModification: WholeCartModification | null;
}

export type Diff =
  | {
      type: "whole_cart";
      percentDiscount?: number;
      fixedDiscount?: number;
      pointsMultiplier?: number;
      blanketPrice?: number;
      itemId?: number;
    }
  | {
      type: "add_free_item";
      item: Record<string, string>;
      quantity: number;
      itemId?: number;
    }
  | {
      type: Exclude<string, "whole_cart" | "add_free_item">;
      itemId: number;
      effect: number;
      quantity: number;
    };

export interface CartItem {
  id: number;
  item: Item;
  quantity: number;
  price: number;
  points: number;
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
export interface DealUse {
  deal_use_id: string;
  created_at: string;
  user_id: string;
  restaurant_id: string;
  policy_id: string;
  transactions: string[];
  count_as_deal: boolean;
}

export interface CreateTransactionsPayload {
  deal_use: DealUse | null;
  transactions: Transaction[];
}

export interface ReturnTransactionsPayload {
  deal_use: DealUse | null;
  transactions: Transaction[];
  userData: User | null;
}

export type Menu = {
  drink: DrinkMenu;
  lineSkip: number;
  cover: number;
};
export interface DrinkMenu {
  liquor: LiquorMenu;
  beer_and_cider: Record<string, number>;
  classic_cocktail: Record<string, number>;
  specialty_option: Record<string, number>;
}

type LiquorMenu = {
  default: number;
} & Record<string, Record<string, string | number>>;

export interface Transaction {
  transaction_id: string;
  created_at: string;
  is_fulfilled: boolean;
  restaurant_id: string;
  user_id: string | null;
  item: string;
  category: string | null;
  deal_use_id: string | null;
  metadata: Record<string, unknown> | null;
  tip_amount: number | null;
  price: number | null;
  points_awarded: number | null;
}

export interface User {
  id: string;
  signed_up: string;
  points: Record<string, number>;
}

export interface Policy {
  policy_id: string;
  name: string;
  header: string | null;
  restaurant_id: string;
  count_as_deal: boolean;
  begin_time: string | null;
  end_time: string | null;
  frequency: string | null;
  definition: PolicyDefinition;
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
  | { type: "apply_order_point_multiplier"; amount: number }
  | { type: "apply_fixed_order_discount"; amount: number }
  | { type: "apply_blanket_price"; amount: number }
  | { type: "apply_order_percent_discount"; amount: number };
