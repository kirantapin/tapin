import type React from "react";
import { useEffect, useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Music,
  UserSearch,
} from "lucide-react";
import { RESTAURANT_PATH } from "@/constants";
import { useNavigate, useParams } from "react-router-dom";
import { Restaurant } from "@/types";
import { project_url } from "@/utils/supabase_client";
import { GradientIcon } from "@/utils/gradient";
import { useRestaurant } from "@/context/restaurant_context";
import { ImageUtils } from "@/utils/image_utils";
import { convertUTCMilitaryTimeTo12HourTime } from "@/utils/time";

const RestaurantInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [openingHoursExpanded, setOpeningHoursExpanded] = useState(true);
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(true);

  const { restaurant, setCurrentRestaurantId } = useRestaurant();

  const navigate = useNavigate();

  const toggleOpeningHours = () => {
    setOpeningHoursExpanded(!openingHoursExpanded);
  };

  const toggleSocialMedia = () => {
    setSocialMediaExpanded(!socialMediaExpanded);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!restaurant) {
    return null;
  }

  const { address, socials, website, openingHours, contactNumber } =
    restaurant.info;

  const hasSocials =
    socials.tiktokLink ||
    socials.twitterLink ||
    socials.facebookLink ||
    socials.instagramLink;

  const hasOpeningHours =
    openingHours.friday ||
    openingHours.monday ||
    openingHours.sunday ||
    openingHours.tuesday ||
    openingHours.saturday ||
    openingHours.wednesday ||
    openingHours.thursday;

  return (
    <div className="flex flex-col w-full mx-auto bg-white min-h-screen">
      <div className="flex items-center p-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10"
          onClick={() => {
            if (
              document.referrer &&
              document.referrer.includes(window.location.origin)
            ) {
              navigate(-1);
            } else {
              navigate(RESTAURANT_PATH.replace(":id", id || ""));
            }
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        {restaurant && (
          <h1 className="text-lg font-semibold flex-1 text-center">
            {restaurant.name}
          </h1>
        )}
        <div className="w-8"></div>
      </div>

      {restaurant && (
        <div className="flex justify-center mt-4 mb-6">
          <img
            src={ImageUtils.getProfileImageUrl(restaurant) || ""}
            alt={`Profile`}
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
        </div>
      )}

      {/* Social Media */}
      {hasSocials && (
        <div className="flex gap-3 mb-4 px-4 overflow-x-auto no-scrollbar">
          {socials.facebookLink && (
            <button
              onClick={() => {
                const url = socials.facebookLink.startsWith("http")
                  ? socials.facebookLink
                  : `http://${socials.facebookLink}`;
                window.open(url, "_blank");
              }}
              className="flex-none flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GradientIcon
                icon={Facebook}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="text-sm font-medium">Facebook</span>
            </button>
          )}

          {socials.twitterLink && (
            <button
              onClick={() => {
                const url = socials.twitterLink.startsWith("http")
                  ? socials.twitterLink
                  : `http://${socials.twitterLink}`;
                window.open(url, "_blank");
              }}
              className="flex-none flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GradientIcon
                icon={Twitter}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="text-sm font-medium">Twitter</span>
            </button>
          )}

          {socials.instagramLink && (
            <button
              onClick={() => {
                const url = socials.instagramLink.startsWith("http")
                  ? socials.instagramLink
                  : `http://${socials.instagramLink}`;
                window.open(url, "_blank");
              }}
              className="flex-none flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GradientIcon
                icon={Instagram}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="text-sm font-medium">Instagram</span>
            </button>
          )}

          {socials.tiktokLink && (
            <button
              onClick={() => {
                const url = socials.tiktokLink.startsWith("http")
                  ? socials.tiktokLink
                  : `http://${socials.tiktokLink}`;
                window.open(url, "_blank");
              }}
              className="flex-none flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GradientIcon
                icon={Music}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="text-sm font-medium">TikTok</span>
            </button>
          )}
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-start gap-3">
            <GradientIcon
              icon={MapPin}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={20}
            />
            <div>
              <div className="font-medium">{address}</div>
            </div>
          </div>
          <ExternalLink
            size={18}
            className="text-gray-400"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`
              )
            }
          />
        </div>
      )}

      {/* Opening Hours */}
      {hasOpeningHours && (
        <div className="border-b">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={toggleOpeningHours}
          >
            <div className="flex items-center gap-3">
              <GradientIcon
                icon={Clock}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="font-medium">Opening Hours</span>
            </div>
            {openingHoursExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>

          <div
            className={`px-12 transition-all duration-300 ease-in-out overflow-hidden ${
              openingHoursExpanded
                ? "max-h-[500px] opacity-100 pb-4"
                : "max-h-0 opacity-0 pb-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-y-1">
              {openingHours.monday && (
                <>
                  <div>Monday</div>
                  <div>
                    {openingHours.monday[0] === openingHours.monday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.monday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.monday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.tuesday && (
                <>
                  <div>Tuesday</div>
                  <div>
                    {openingHours.tuesday[0] === openingHours.tuesday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.tuesday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.tuesday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.wednesday && (
                <>
                  <div>Wednesday</div>
                  <div>
                    {openingHours.wednesday[0] === openingHours.wednesday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.wednesday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.wednesday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.thursday && (
                <>
                  <div>Thursday</div>
                  <div>
                    {openingHours.thursday[0] === openingHours.thursday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.thursday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.thursday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.friday && (
                <>
                  <div>Friday</div>
                  <div>
                    {openingHours.friday[0] === openingHours.friday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.friday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.friday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.saturday && (
                <>
                  <div>Saturday</div>
                  <div>
                    {openingHours.saturday[0] === openingHours.saturday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.saturday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.saturday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {openingHours.sunday && (
                <>
                  <div>Sunday</div>
                  <div>
                    {openingHours.sunday[0] === openingHours.sunday[1] ? (
                      "Closed"
                    ) : (
                      <>
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.sunday[0],
                          restaurant.metadata.timezone as string
                        )}{" "}
                        -{" "}
                        {convertUTCMilitaryTimeTo12HourTime(
                          openingHours.sunday[1],
                          restaurant.metadata.timezone as string
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phone */}
      {contactNumber && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <GradientIcon
              icon={Phone}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={20}
            />
            <span>{contactNumber}</span>
          </div>
        </div>
      )}

      {/* Website */}
      {website && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <GradientIcon
              icon={Globe}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={20}
            />
            <span>{website}</span>
          </div>
          <ExternalLink
            size={18}
            className="text-gray-400"
            onClick={() => {
              // Add http:// if not present
              const url = website.startsWith("http")
                ? website
                : `http://${website}`;
              window.open(url, "_blank");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;
