import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context";

export const AuthVerify = () => {
  const supabase = useSupabase();
  const { userSession, logout, login, is_authenticated } = useAuth();

  const sendOTP = async () => {
    // try {
    //   const data = await supabase.auth.signInWithOtp({ phone: phone });
    //   if (data.error) {
    //     console.error("Error sending OTP:", data.error.message);
    //     return false;
    //   }
    //   console.log("OTP sent successfully");
    //   return true;
    // } catch (err) {
    //   console.error("Unexpected error:", err);
    //   return false;
    // }
    console.log("send OTP");
  };

  const verifyOTP = async () => {
    // try {
    //   // Verify the OTP code
    //   const { data, error } = await supabase.auth.verifyOtp({
    //     phone,
    //     token: otp,
    //     type: "sms",
    //   });

    //   if (error) {
    //     console.error("Error verifying OTP:", error.message);
    //     return false;
    //   }

    //   // Save access and refresh tokens to localStorage
    //   const accessToken = data.session?.access_token;
    //   const refreshToken = data.session?.refresh_token;

    //   if (accessToken && refreshToken) {
    //     const info = data.session;
    //     info.phone_number = phone;
    //     login(info);

    //     console.log("Tokens saved to localStorage");
    //     return true;
    //   } else {
    //     console.error("Failed to retrieve tokens");
    //     return false;
    //   }
    // } catch (err) {
    //   console.error("Unexpected error:", err);
    //   return false;
    // }
    console.log("verifying otp");
  };

  return (
    <div>
      <button onClick={sendOTP}>Send OTP</button>
      <button onClick={verifyOTP}>Verify OTP</button>
    </div>
  );
};
