export const restaurantStyles = {
  container: "flex flex-col min-h-screen bg-gray-50",
  headerContainer: "relative h-40",
  headerImage: "object-cover w-full h-full",
  headerOverlay: "absolute inset-0 bg-black/40",
  headerNav: "absolute top-4 left-4 right-4 flex items-center justify-between",
  menuButton: "text-white",
  menuIcon: "w-6 h-6",
  headerActions: "flex gap-4",
  actionIcon: "w-6 h-6 text-white",

  restaurantInfo: "relative px-4 pb-4",
  restaurantLogo:
    "absolute -top-8 left-4 rounded-full overflow-hidden border-4 border-white",
  logoImage: "w-[72px] h-[72px] bg-white",
  infoContainer: "pt-12",
  restaurantName: "text-2xl font-bold",
  infoRow: "flex items-center gap-1 text-sm text-gray-600 mt-1",
  infoIcon: "w-4 h-4",
  ratingContainer: "flex items-center ml-2",
  ratingStar: "w-4 h-4 fill-yellow-400 text-yellow-400",

  pointsBanner:
    "flex items-center justify-between bg-gray-100 rounded-lg p-4 mt-4",
  bannerText: "text-sm",
  bannerArrow: "w-5 h-5 text-gray-400",

  navigationTabs: "mt-4",
  tabsContainer: "flex border-b",
  tab: (isActive: boolean) =>
    `flex-1 py-2 px-4 text-center ${
      isActive ? "border-b-2 border-red-500 text-red-500" : "text-gray-500"
    }`,

  offersContainer: "space-y-4 mt-4",
  offerCard: "bg-[#2A2F45] text-white rounded-lg p-4",
  offerTitle: "font-semibold text-lg",
  offerDescription: "text-sm text-gray-300 mt-1",
  offerButton: "mt-4 px-4 py-2 bg-white text-[#2A2F45] rounded-md font-medium",
};
