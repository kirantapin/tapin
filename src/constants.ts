import { DealEffectPayload } from "./types";
//test related

//paths
export const BASE_PATH = "/";
export const DRINK_CHECKOUT_PATH = "/restaurant/:id/drink_checkout";
export const RESTAURANT_PATH = "/restaurant/:id";
export const APPLOAD_PATH = "";
export const LOYALTY_REWARD_PATH = "/restaurant/:id/rewards";
export const MY_SPOT_PATH = "/restaurant/:id/my_spot";
export const OFFERS_PAGE_PATH = "/restaurant/:id/offers";
export const SINGLE_POLICY_PAGE_PATH = "/restaurant/:id/offers/:policy_id";
export const INFO_PAGE_PATH = "/restaurant/:id/info";
export const DEVICE_NOT_SUPPORTED_PATH = "/device-not-supported";

//objects
export const emptyDealEffect: DealEffectPayload = {
  addedItems: [],
  modifiedItems: [],
  wholeCartModification: null,
};

//error messages
export const MISSING_USER_ID = "User ID is required but wasn't received.";

//storage
export const STORAGE_TTL = 6 * 60 * 1000;

export const DRINK_MENU_TAG = "drink";
export const FOOD_MENU_TAG = "food";
export const PASS_MENU_TAG = "passes";
export const BUNDLE_MENU_TAG = "bundles";
export const LIQUOR_MENU_TAG = "liquors";
export const SPECIALTY_DRINKS_TAG = "7";
export const COCKTAILS_TAG = "6";
export const BEER_AND_CIDER_TAG = "5";

export const COCKTAILS_LABEL = "Cocktails";
export const HOUSE_MIXER_LABEL = "House Mixers";
export const SHOTS_SHOOTERS_LABEL = "Shots or Shooters";
export const SPECIALTY_DRINKS_LABEL = "Specialty Drinks";
export const BEER_AND_CIDER_LABEL = "Beer and Ciders";
export const PASS_LABEL = "Passes";

export const MENU_DISPLAY_MAP = {
  [HOUSE_MIXER_LABEL]: LIQUOR_MENU_TAG,
  [BEER_AND_CIDER_LABEL]: BEER_AND_CIDER_TAG,
  [SHOTS_SHOOTERS_LABEL]: LIQUOR_MENU_TAG,
  [COCKTAILS_LABEL]: COCKTAILS_TAG,
  [SPECIALTY_DRINKS_LABEL]: SPECIALTY_DRINKS_TAG,
  [PASS_LABEL]: PASS_MENU_TAG,
  Food: FOOD_MENU_TAG,
};

export const LOYALTY_REWARD_TAG = "loyalty_reward";
export const NORMAL_DEAL_TAG = "deal";
export const ADD_ON_TAG = "add_on";

export const KNOWN_MODIFIERS: Record<string, number> = { double: 2, triple: 3 };

export const PASS_INDICATOR = "@";

export const ADD_ITEM = "add_item";
export const REMOVE_ITEM = "remove_item";
export const ADD_POLICY = "add_policy";
export const REMOVE_POLICY = "remove_policy";
export const REFRESH = "refresh";
export const NEW_USER_SESSION = "new_user_session";

export const HISTORY_KEY = "history";

export const RESTAURANT_IMAGE_BUCKET = "restaurant_images";
export const BUNDLE_IMAGE_BUCKET = "bundle-images";
