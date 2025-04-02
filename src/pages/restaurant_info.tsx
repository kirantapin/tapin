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
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { Restaurant } from "@/types";
import { project_url } from "@/utils/supabase_client";

const RestaurantInfo: React.FC = () => {
  const [openingHoursExpanded, setOpeningHoursExpanded] = useState(true);
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(true);

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const { id: restaurant_id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const toggleOpeningHours = () => {
    setOpeningHoursExpanded(!openingHoursExpanded);
  };

  const toggleSocialMedia = () => {
    setSocialMediaExpanded(!socialMediaExpanded);
  };

  useEffect(() => {
    if (!restaurant_id) {
      navigate("/not_found_page");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      if (!restaurantData) {
        navigate("/not_found_page");
      }

      setRestaurant(restaurantData as Restaurant);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          className="p-2 rounded-full bg-gray-100"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        >
          <ChevronLeft size={20} />
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
            src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
            alt={`Profile`}
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
        </div>
      )}

      {/* Address */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-gray-500 mt-0.5" />
          <div>
            <div className="font-medium">901 U St NW</div>
            <div className="text-gray-500">Washington, DC 20001</div>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      {/* Opening Hours */}
      <div className="border-b">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={toggleOpeningHours}
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-gray-500" />
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
              <div>Monday</div>
              <div>5:00PM - 12:00 AM</div>
              <div>Tuesday</div>
              <div>5:00PM - 12:00 AM</div>
              <div>Wednesday</div>
              <div>5:00PM - 12:00 AM</div>
              <div>Thursday</div>
              <div>5:00PM - 1:00 AM</div>
              <div>Friday</div>
              <div>5:00PM - 2:00 AM</div>
              <div>Saturday</div>
              <div>5:00PM - 2:00 AM</div>
              <div className="text-blue-500">Sunday</div>
              <div className="text-blue-500">12:00PM - 12:00 AM</div>
            </div>
          </div>
        )}
      </div>

      {/* Phone */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Phone size={20} className="text-gray-500" />
          <span>(202) 525-3276</span>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      {/* Website */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-gray-500" />
          <span>www.yourbar.com</span>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      {/* Social Media */}
      <div className="border-b">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={toggleSocialMedia}
        >
          <div className="flex items-center gap-3">
            <UserSearch size={20} className="text-gray-500" />
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Facebook size={20} className="text-gray-500" />
                  <span>Facebook</span>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Twitter size={20} className="text-gray-500" />
                  <span>Twitter</span>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram size={20} className="text-gray-500" />
                  <span>Instagram</span>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music size={20} className="text-gray-500" />
                  <span>TikTok</span>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfo;
