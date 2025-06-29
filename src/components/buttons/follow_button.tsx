import React, { useEffect, useState } from "react";
import { CheckIcon, Plus } from "lucide-react";
import { useRestaurant } from "@/context/restaurant_context";
import { useAuth } from "@/context/auth_context";
import { supabase } from "@/utils/supabase_client";
import { Alert } from "@/components/display_utils/alert";
import { useBottomSheet } from "@/context/bottom_sheet_context";

interface Follow {
  user_id: string;
  restaurant_id: string;
  follows: boolean;
}

const legalityCheck =
  "By submitting this form and signing up for texts, you consent to receive marketing text messages (e.g. promos, cart reminders) from RESTAURANT_NAME at the number provided at sign up, including messages sent by autodialer. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Unsubscribe at any time by replying STOP or clicking the unsubscribe link (where available). Privacy Policy & Terms.";

const followRestaurant = async (user_id: string, restaurant_id: string) => {
  // First check if a row exists
  const { data: existingData } = await supabase
    .from("follows")
    .select("*")
    .eq("user_id", user_id)
    .eq("restaurant_id", restaurant_id)
    .maybeSingle();

  if (existingData) {
    // Row exists, update follows to true
    const { data, error } = await supabase
      .from("follows")
      .update({ follows: true })
      .eq("user_id", user_id)
      .eq("restaurant_id", restaurant_id);
    if (error) throw error;
  } else {
    // Row doesn't exist, insert new row with follows true
    const { data, error } = await supabase
      .from("follows")
      .insert({ user_id, restaurant_id, follows: true });
    if (error) throw error;
  }
};

const unfollowRestaurant = async (user_id: string, restaurant_id: string) => {
  const { data, error } = await supabase
    .from("follows")
    .update({ follows: false })
    .eq("user_id", user_id)
    .eq("restaurant_id", restaurant_id);
  if (error) throw error;
};

const FollowButton: React.FC = () => {
  const { restaurant } = useRestaurant();
  const { userSession } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const { openSignInModal } = useBottomSheet();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (userSession?.user.id && restaurant?.id) {
        try {
          await doesUserFollowRestaurant(userSession.user.id, restaurant.id);
        } catch (error) {
          setIsFollowing(false);
          console.error("Error checking follow status:", error);
        }
      } else {
        setIsFollowing(false);
      }
    };
    checkFollowStatus();
  }, [userSession, restaurant]);

  const doesUserFollowRestaurant = async (
    user_id: string,
    restaurant_id: string
  ): Promise<void> => {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("user_id", user_id)
      .eq("restaurant_id", restaurant_id)
      .maybeSingle();

    if (error) {
      setIsFollowing(false);
      throw error;
    }
    setIsFollowing(data?.follows ?? false);
  };

  if (!restaurant) {
    return null;
  }

  if (!userSession) {
    return (
      <button
        onClick={() => {
          openSignInModal();
        }}
        className="inline-flex justify-center items-center relative rounded-full px-3 py-1.5 border hover:opacity-80 transition-opacity"
        style={{
          borderColor: restaurant?.metadata.primaryColor,
        }}
      >
        <div className="relative flex items-center gap-1">
          <Plus
            size={17}
            className="pb-[1px]"
            style={{ color: restaurant?.metadata.primaryColor }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: restaurant?.metadata.primaryColor }}
          >
            Follow
          </p>
        </div>
      </button>
    );
  }

  if (isFollowing) {
    return (
      <button
        onClick={() => {}}
        className="inline-flex justify-center items-center relative rounded-full px-3 py-1.5   transition-opacity"
        style={{
          backgroundColor: restaurant?.metadata.primaryColor,
        }}
      >
        <Alert
          key={isFollowing ? "following" : "not following"}
          trigger={
            <div className="relative flex items-center gap-1">
              <CheckIcon
                size={17}
                className="pb-[1px]"
                style={{ color: "white" }}
              />
              <p className="text-sm font-semibold" style={{ color: "white" }}>
                Following
              </p>
            </div>
          }
          title={`Unfollow ${restaurant.name}?`}
          description={`You will no longer receive notifications for new deals, events, and updates at ${restaurant.name}.`}
          onConfirm={async () => {
            await unfollowRestaurant(userSession.user.id, restaurant.id);
            await doesUserFollowRestaurant(userSession.user.id, restaurant.id);
          }}
          confirmLabel="Unfollow"
          cancelLabel="Keep Following"
        />
      </button>
    );
  } else {
    return (
      <button
        onClick={() => {}}
        className="inline-flex justify-center items-center relative rounded-full px-3 py-1.5 border hover:opacity-80 transition-opacity"
        style={{
          borderColor: restaurant?.metadata.primaryColor,
        }}
      >
        <Alert
          key={isFollowing ? "following" : "not following"}
          trigger={
            <div className="relative flex items-center gap-1">
              <Plus
                size={17}
                className="pb-[1px]"
                style={{ color: restaurant?.metadata.primaryColor }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: restaurant?.metadata.primaryColor }}
              >
                Follow
              </p>
            </div>
          }
          title={`Follow ${restaurant.name}?`}
          description={legalityCheck.replace(
            "RESTAURANT_NAME",
            restaurant.name
          )}
          onConfirm={async () => {
            await followRestaurant(userSession.user.id, restaurant.id);
            await doesUserFollowRestaurant(userSession.user.id, restaurant.id);
          }}
          confirmLabel="Follow"
          cancelLabel="Cancel"
        />
      </button>
    );
  }
};

export default FollowButton;
