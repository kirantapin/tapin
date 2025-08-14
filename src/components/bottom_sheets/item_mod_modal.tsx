// import React from "react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { X } from "lucide-react";
// import LiquorForm from "../liquor_form";
// import { useRestaurant } from "@/context/restaurant_context";
// import { Item } from "@/types";

// interface ItemModModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   menuLabel: string | null;
//   onSelect: ((item: Item) => void) | null;
//   addToCart: (item: Item, showToast?: boolean) => Promise<void>;
// }

// const ItemModModal: React.FC<ItemModModalProps> = ({
//   isOpen,
//   onClose,
//   menuLabel,
//   onSelect,
//   addToCart,
// }) => {
//   const { restaurant } = useRestaurant();
//   if (!restaurant) return null;
//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent
//         side="bottom"
//         className="h-[65vh] rounded-t-3xl [&>button]:hidden p-0"
//       >
//         <div className="flex flex-col h-full">
//           <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b border-gray-200">
//             <div className="flex justify-between items-start">
//               <SheetTitle className="text-2xl font-bold">
//                 Make Your Drink
//               </SheetTitle>
//               <button
//                 onClick={() => {
//                   onClose();
//                 }}
//                 className="text-black bg-gray-200 rounded-full p-2 focus:outline-none"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//           </SheetHeader>

//           <div className="flex-1 overflow-y-auto">
//             <LiquorForm
//               type={menuLabel ?? ""}
//               restaurant={restaurant}
//               primaryColor={restaurant.metadata.primaryColor}
//               afterAdd={async (item) => {
//                 if (onSelect) {
//                   await onSelect(item);
//                 } else {
//                   await addToCart(item, true);
//                 }
//                 onClose();
//               }}
//             />
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// };

// export default ItemModModal;
