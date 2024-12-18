import { DealEffectPayload } from "./types";
//test related
export const TEST_MODE = true;
export const TEST_USER = {
  phone: "1234567891",
  accessToken: "",
  refreshToken: "",
};

//paths
export const BASE_PATH = "/";
export const QR_CODE_PATH = "/qrcode/";
export const DRINK_CHECKOUT_PATH = "/restaurant/:id/drink_checkout";
export const SIGNIN_PATH = "/sign_in";
export const RESTAURANT_PATH = "/restaurant/:id";
export const APPLOAD_PATH = "";
export const DISCOVER_PATH = "/discover";

//objects
export const emptyDealEffect: DealEffectPayload = {
  freeAddedItems: [],
  modifiedItems: [],
  wholeCartModification: null,
};

//error messages
export const MISSING_USER_ID = "User ID is required but wasn't received.";

//storage
export const STORAGE_PREFIX = "state:";
export const STORAGE_TTL = 6 * 60 * 1000;
