import { supabase } from "./supabase_client";

export const fakePhoneSignIn = async () => {
  const fakePhone = "+1234567891";
  const fakeOtp = "123456"; // Use a predefined OTP for development

  try {
    // Step 1: Send OTP (this would normally send an SMS, but we skip this in dev)
    const { error: sendError } = await supabase.auth.signInWithOtp({
      phone: fakePhone,
    });

    if (sendError) {
      console.error("Error sending OTP:", sendError.message);
      return;
    }

    console.log("Fake OTP sent to phone:", fakePhone);

    // Step 2: Verify OTP
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: fakePhone,
      token: fakeOtp,
      type: "sms",
    });

    if (verifyError) {
      console.error("Error verifying OTP:", verifyError.message);
      return;
    }

    console.log("Fake phone sign-in successful:", data);
  } catch (err) {
    console.error("Unexpected error during fake phone sign-in:", err);
  }
};
