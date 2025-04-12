import { DealEffectPayload } from "./types";
//test related
export const TEST_MODE = true;
export const TEST_USER_SESSION = {
  user: {
    phone: "15712460782",
    accessToken: "",
    refreshToken: "",
  },
};

//paths
export const BASE_PATH = "/";
export const QR_CODE_PATH = "/restaurant/:id/qrcode";
export const DRINK_CHECKOUT_PATH = "/restaurant/:id/drink_checkout";
export const SIGNIN_PATH = "/signin";
export const RESTAURANT_PATH = "/restaurant/:id";
export const APPLOAD_PATH = "";
export const DISCOVER_PATH = "/discover";
export const LOYALTY_REWARD_PATH = "/restaurant/:id/rewards";
export const PREVIOUS_TRANSACTIONS_PATH =
  "/restaurant/:id/previous_transactions";
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
export const STORAGE_PREFIX = "state:";
export const STORAGE_TTL = 6 * 60 * 1000;

export const DRINK_MENU_TAG = "drink";
export const FOOD_MENU_TAG = "food";
export const PASS_MENU_TAG = "passes";
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
  [HOUSE_MIXER_LABEL]: [DRINK_MENU_TAG, "house_mixer"],
  [BEER_AND_CIDER_LABEL]: BEER_AND_CIDER_TAG,
  [SHOTS_SHOOTERS_LABEL]: [DRINK_MENU_TAG, "shots_or_shooters"],
  [COCKTAILS_LABEL]: COCKTAILS_TAG,
  [SPECIALTY_DRINKS_LABEL]: SPECIALTY_DRINKS_TAG,
  [PASS_LABEL]: PASS_MENU_TAG,
  Food: FOOD_MENU_TAG,
};

export const LOYALTY_REWARD_TAG = "loyalty_reward";
export const NORMAL_DEAL_TAG = "deal";
export const ADD_ON_TAG = "add_on";

// black greyscale 700
// gray background grayscale 300
// gray on gray background grayscale 500

export const KNOWN_MODIFIERS = { double: 2, triple: 3 };

export const PASS_INDICATOR = "@";

export const ADD_ITEM = "add_item";
export const REMOVE_ITEM = "remove_item";
export const ADD_POLICY = "add_policy";
export const REMOVE_POLICY = "remove_policy";
export const SANITY_CHECK = "sanity_check";

export const HISTORY_KEY = "history";

export const RESTAURANT_IMAGE_BUCKET = "restaurant_images";
