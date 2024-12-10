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
export const DRINK_CHECKOUT_PATH = "/drink_checkout";
export const SIGNIN_PATH = "/sign_in";

//objects
export const emptyDealEffect: DealEffectPayload = {
  freeAddedItems: [],
  modifiedItems: [],
  wholeCartModification: null,
};
