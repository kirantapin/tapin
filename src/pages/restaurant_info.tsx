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
    if (id) {
      setCurrentRestaurantId(id);
    }
  }, [id]);

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

  const convertMilitaryTimeTo12HourTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const isPm = parseInt(hours) >= 12;
    const hour = parseInt(hours) % 12 || 12;
    return `${hour}:${minutes}${isPm ? "PM" : "AM"}`;
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant.id));
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
        <div className="flex justify-center mt-4 mb-2">
          <img
            src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`}
            alt={`Profile`}
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
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

          {openingHoursExpanded && (
            <div className="px-12 pb-4">
              <div className="grid grid-cols-2 gap-y-1">
                {openingHours.monday && (
                  <>
                    <div>Monday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(openingHours.monday[0])}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(openingHours.monday[1])}
                    </div>
                  </>
                )}
                {openingHours.tuesday && (
                  <>
                    <div>Tuesday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(openingHours.tuesday[0])}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(openingHours.tuesday[1])}
                    </div>
                  </>
                )}
                {openingHours.wednesday && (
                  <>
                    <div>Wednesday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.wednesday[0]
                      )}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.wednesday[1]
                      )}
                    </div>
                  </>
                )}
                {openingHours.thursday && (
                  <>
                    <div>Thursday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.thursday[0]
                      )}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.thursday[1]
                      )}
                    </div>
                  </>
                )}
                {openingHours.friday && (
                  <>
                    <div>Friday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(openingHours.friday[0])}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(openingHours.friday[1])}
                    </div>
                  </>
                )}
                {openingHours.saturday && (
                  <>
                    <div>Saturday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.saturday[0]
                      )}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(
                        openingHours.saturday[1]
                      )}
                    </div>
                  </>
                )}
                {openingHours.sunday && (
                  <>
                    <div>Sunday</div>
                    <div>
                      {convertMilitaryTimeTo12HourTime(openingHours.sunday[0])}{" "}
                      -{" "}
                      {convertMilitaryTimeTo12HourTime(openingHours.sunday[1])}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
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
            onClick={() => window.open(website)}
          />
        </div>
      )}

      {/* Social Media */}
      {hasSocials && (
        <div className="border-b">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={toggleSocialMedia}
          >
            <div className="flex items-center gap-3">
              <GradientIcon
                icon={UserSearch}
                primaryColor={restaurant?.metadata.primaryColor as string}
                size={20}
              />
              <span className="font-medium">Socials</span>
            </div>
            {socialMediaExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>

          {socialMediaExpanded && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                {socials.facebookLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GradientIcon
                        icon={Facebook}
                        primaryColor={
                          restaurant?.metadata.primaryColor as string
                        }
                        size={20}
                      />
                      <span>Facebook</span>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-gray-400"
                      onClick={() => window.open(socials.facebookLink)}
                    />
                  </div>
                )}

                {socials.twitterLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GradientIcon
                        icon={Twitter}
                        primaryColor={
                          restaurant?.metadata.primaryColor as string
                        }
                        size={20}
                      />
                      <span>Twitter</span>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-gray-400"
                      onClick={() => window.open(socials.twitterLink)}
                    />
                  </div>
                )}

                {socials.instagramLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GradientIcon
                        icon={Instagram}
                        primaryColor={
                          restaurant?.metadata.primaryColor as string
                        }
                        size={20}
                      />
                      <span>Instagram</span>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-gray-400"
                      onClick={() => window.open(socials.instagramLink)}
                    />
                  </div>
                )}

                {socials.tiktokLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GradientIcon
                        icon={Music}
                        primaryColor={
                          restaurant?.metadata.primaryColor as string
                        }
                        size={20}
                      />
                      <span>TikTok</span>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-gray-400"
                      onClick={() => window.open(socials.tiktokLink)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;
