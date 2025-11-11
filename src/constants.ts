import { DealEffectPayload } from "./types";
//test related

//paths
export const BASE_PATH = "/";
export const RESTAURANT_PATH = "/:id";
export const MY_SPOT_PATH = "/:id/my_spot";
export const OFFERS_PAGE_PATH = "/:id/offers";
export const INFO_PAGE_PATH = "/:id/info";
export const NOT_FOUND_PATH = "/error/not_found";

//objects
export const emptyDealEffect: DealEffectPayload = {
  addedItems: [],
  modifiedItems: [],
  wholeCartModification: [],
};

export const DRINK_MENU_TAG = "drink";
export const FOOD_MENU_TAG = "food";
export const PASS_MENU_TAG = "passes";
export const BUNDLE_MENU_TAG = "bundles";
export const SPECIALTY_DRINKS_TAG = "7";
export const COCKTAILS_TAG = "cocktails";
export const BEER_AND_CIDER_TAG = "beer_and_cider";
export const WINE_TAG = "wine";

export const HOUSE_MIXER_LABEL = "House Mixers";
export const SHOTS_SHOOTERS_LABEL = "Shots or Shooters";

export const LOYALTY_REWARD_TAG = "loyalty_reward";
export const NORMAL_DEAL_TAG = "deal";
export const ADD_ON_TAG = "add_on";

export const ADD_ITEM = "add_item";
export const REMOVE_ITEM = "remove_item";
export const ADD_POLICY = "add_policy";
export const REMOVE_POLICY = "remove_policy";
export const REFRESH = "refresh";
export const NEW_USER_SESSION = "new_user_session";

export const HISTORY_KEY = "history";

export const RESTAURANT_IMAGE_BUCKET = "restaurant-images";
export const BUNDLE_IMAGE_BUCKET = "bundle-images";
export const ITEM_IMAGE_BUCKET = "item-images";
export const HIGHLIGHT_IMAGE_BUCKET = "highlight-images";

export const POINTS_PER_DOLLAR = 10;
export const MIN_PAYMENT_AMOUNT = 1; //50 cents

export const MAX_BUNDLE_DURATION = 90;
export const MAX_TRANSACTION_LOOKBACK = MAX_BUNDLE_DURATION;

export const RESERVED_MENU_KEYWORDS = ["name", "label", "sortWeight"];
export const MAX_QR_TRANSACTIONS = 10;

export const NO_FULFILLED_BY = "loc";

const useSquareSandbox = false;
export const SQUARE_APP_ID = useSquareSandbox
  ? process.env.REACT_APP_SQUARE_APPLICATION_ID_SANDBOX!
  : process.env.REACT_APP_SQUARE_APPLICATION_ID!;

//PURCHASE SIGNALS
export const BUNDLE_PURCHASED_SIGNAL = "bundle_purchased";
