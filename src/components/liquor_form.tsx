// import React, { useEffect, useState } from "react";
// import { HOUSE_MIXER_LABEL, LIQUOR_MENU_TAG } from "@/constants";
// import { titleCase } from "title-case";
// import { useBottomSheet } from "@/context/bottom_sheet_context";
// import { Item, Restaurant } from "@/types";

// const LiquorForm = ({
//   type,
//   restaurant,
//   primaryColor,
//   afterAdd,
// }: {
//   type: string;
//   restaurant: Restaurant;
//   primaryColor: string;
//   afterAdd: (item: Item) => Promise<void>;
// }) => {
//   const { triggerToast } = useBottomSheet();
//   const [liquorType, setLiquorType] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);
//   const [liquorBrand, setLiquorBrand] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);
//   const [selectedMixer, setSelectedMixer] = useState("");
//   const [modifiers, setModifiers] = useState<string[]>([]);

//   const [loading, setLoading] = useState(false);
//   const modifierGroups = {
//     amount: ["double", "triple"],
//     mixer: [
//       "coca cola",
//       "diet coke",
//       "sprite",
//       "ginger ale",
//       "tonic",
//       "soda",
//       "cranberry",
//       "orange juice",
//       "pineapple juice",
//       "grapefruit juice",
//       "red bull",
//       "water",
//       "lemonade",
//     ],
//   };

//   const menu = restaurant.menu;
//   const liquorChildIds = menu[LIQUOR_MENU_TAG].children;
//   const liquors: { id: string; name: string }[] = liquorChildIds.map(
//     (id: string) => {
//       return { id: id, name: menu[id].info.name };
//     }
//   );
//   const liquorBrandIds = liquorType
//     ? restaurant.menu[liquorType.id].children
//     : [];
//   const liquorBrands: { id: string; name: string }[] = liquorBrandIds.map(
//     (id: string) => {
//       return { id: id, name: menu[id].info.name };
//     }
//   );

//   useEffect(() => {
//     if (liquorType) {
//       const houseBrand = liquorBrands.find((brand) =>
//         brand.name.toLowerCase().includes("house")
//       );
//       if (houseBrand) {
//         setLiquorBrand({ id: houseBrand.id, name: houseBrand.name });
//       } else {
//         setLiquorBrand(null);
//       }
//     }
//   }, [liquorType]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!liquorType) {
//       triggerToast("Please select a Liquor", "error");
//       return;
//     }
//     if (!liquorBrand) {
//       triggerToast(`Please select a specific ${liquorType.name}`, "error");
//       return;
//     }
//     const itemToAdd = {
//       id: liquorBrand.id,
//       modifiers: modifiers,
//     };

//     if (type === HOUSE_MIXER_LABEL) {
//       if (!selectedMixer) {
//         triggerToast("Please select a Mixer", "error");
//         return;
//       }
//       itemToAdd.modifiers.push(`with ${titleCase(selectedMixer)}`);
//     }

//     setLoading(true);
//     await afterAdd(itemToAdd);
//     setLoading(false);

//     setLiquorType(null);
//     setLiquorBrand(null);
//     setSelectedMixer("");
//     setModifiers([]);
//   };

//   const addModifier = (modifier: string) => {
//     if (modifier.trim() && !modifiers.includes(modifier.trim())) {
//       setModifiers((prevModifiers) => [...prevModifiers, modifier.trim()]);
//     }
//   };

//   const removeModifier = (modifier: string) => {
//     setModifiers((prevModifiers) =>
//       prevModifiers.filter((mod) => mod !== modifier)
//     );
//   };

//   const toggleModifier = (group: "amount" | "mixer", modifier: string) => {
//     if (modifiers.includes(modifier)) {
//       removeModifier(modifier);
//     } else {
//       const allGroupModifiers = modifierGroups[group];
//       for (const mod of allGroupModifiers) {
//         if (modifiers.includes(mod)) {
//           removeModifier(mod);
//         }
//       }
//       addModifier(modifier);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col h-full">
//       <div className="flex-1 space-y-4 p-5 pt-4 rounded-2xl overflow-y-auto">
//         {/* Liquor Buttons */}
//         <div>
//           <label className="block text-md font-semibold text-gray-700 mb-2">
//             Select Liquor
//           </label>
//           <div className="grid grid-cols-2 gap-2">
//             {liquors.map((liquor) => (
//               <button
//                 key={liquor.id}
//                 type="button"
//                 onClick={() => setLiquorType(liquor)}
//                 className="p-3 rounded-full text-md font-medium transition-colors duration-200 border bg-transparent"
//                 style={{
//                   borderColor:
//                     liquorType?.id === liquor.id ? primaryColor : "#e5e7eb",
//                   color:
//                     liquorType?.id === liquor.id ? primaryColor : "#374151",
//                 }}
//               >
//                 {titleCase(liquor.name)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Liquor Brand Buttons (shows only if a liquor is selected) */}
//         {liquorType && liquorBrands.length > 0 && (
//           <div>
//             <label className="block text-md font-semibold text-gray-700 mb-2 mt-4">
//               Select {titleCase(liquorType.name)} Brand
//             </label>
//             <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
//               {liquorBrands.map((brand: { id: string; name: string }) => (
//                 <button
//                   key={brand.id}
//                   type="button"
//                   onClick={() => setLiquorBrand(brand)}
//                   className="flex-none p-3 rounded-full text-md font-medium transition-colors duration-200 border bg-transparent"
//                   style={{
//                     borderColor:
//                       liquorBrand?.id === brand.id ? primaryColor : "#e5e7eb",
//                     color:
//                       liquorBrand?.id === brand.id ? primaryColor : "#374151",
//                   }}
//                 >
//                   {titleCase(brand.name)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Mixer Buttons */}
//         {type === HOUSE_MIXER_LABEL && (
//           <div>
//             <label className="block text-md font-semibold text-gray-700 mb-2">
//               Select Mixer
//             </label>
//             <div className="grid grid-cols-2 gap-2">
//               {modifierGroups.mixer.map((mixer) => (
//                 <button
//                   key={mixer}
//                   type="button"
//                   onClick={() => setSelectedMixer(mixer)}
//                   className="p-3 rounded-full text-md font-medium transition-colors duration-200 border bg-transparent"
//                   style={{
//                     borderColor:
//                       selectedMixer === mixer ? primaryColor : "#e5e7eb",
//                     color: selectedMixer === mixer ? primaryColor : "#374151",
//                   }}
//                 >
//                   {titleCase(mixer)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Modifiers Section */}
//         {type === HOUSE_MIXER_LABEL && (
//           <div>
//             <label className="block text-md font-semibold text-gray-700">
//               Modifiers
//             </label>
//             <div className="flex gap-2 mt-2">
//               {modifierGroups.amount.map((option) => (
//                 <button
//                   key={option}
//                   type="button"
//                   onClick={() => toggleModifier("amount", option)}
//                   className={`px-4 py-2 text-black border bg-white rounded-full cursor-pointer transition font-medium text-md`}
//                   style={{
//                     borderColor: modifiers.includes(option)
//                       ? primaryColor
//                       : "#e5e7eb",
//                     color: modifiers.includes(option)
//                       ? primaryColor
//                       : "#374151",
//                   }}
//                 >
//                   {titleCase(option)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex-none px-5 pb-5">
//         <button
//           type="submit"
//           className="w-full text-white py-3 rounded-full transition"
//           style={{
//             background: restaurant?.metadata.primaryColor,
//           }}
//         >
//           {loading ? (
//             <div className="flex justify-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//             </div>
//           ) : (
//             "Select"
//           )}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default LiquorForm;
