import { Item, ItemSpecification, Restaurant } from "@/types";
import { ItemUtils } from "@/utils/item_utils";

// const getItemByName = (
//   name: string,
//   whiteListCategories: ItemSpecification[] | null = null,
//   modifiers: string[] = [],
//   restaurant: Restaurant
// ): Item | null => {
//   const lowerName = name.toLowerCase();
//   const menuKey = Object.keys(restaurant.menu).find(
//     (key) =>
//       restaurant.menu[key].info?.name?.toLowerCase().includes(lowerName) &&
//       (whiteListCategories === null ||
//         whiteListCategories.some((category) =>
//           restaurant.menu[key].path?.includes(category)
//         ))
//   );
//   if (!menuKey) return null;
//   const allChildren = ItemUtils.getAllItemsInCategory(menuKey, restaurant);
//   if (allChildren.length === 0) return null;
//   return {
//     id: allChildren[0],
//     modifiers: modifiers,
//   };
// };

// export const getSuggestedMenuItems = ({
//   type,
//   filters,
//   restaurant,
//   whiteListCategories,
// }: {
//   type: string;
//   filters: ((object: any) => boolean)[];
//   restaurant: Restaurant;
//   whiteListCategories: ItemSpecification[] | null;
// }): Item[] => {
//   const exampleItems: { liquorName: string; modifiers: string[] }[] = [
//     {
//       liquorName: "rum",
//       modifiers: type === HOUSE_MIXER_LABEL ? ["with Coke"] : [],
//     },
//     {
//       liquorName: "vodka",
//       modifiers: type === HOUSE_MIXER_LABEL ? ["with Sprite"] : [],
//     },
//     {
//       liquorName: "tequila",
//       modifiers: type === HOUSE_MIXER_LABEL ? ["with Soda"] : [],
//     },
//     {
//       liquorName: "whiskey",
//       modifiers: type === HOUSE_MIXER_LABEL ? ["with Coke"] : [],
//     },
//     {
//       liquorName: "gin",
//       modifiers: type === HOUSE_MIXER_LABEL ? ["with Tonic"] : [],
//     },
//   ];

//   const processedTransactionItems: Item[] = [];
//   const processedSuggestedItems: Item[] = exampleItems
//     .map((item) =>
//       getItemByName(
//         item.liquorName,
//         whiteListCategories,
//         item.modifiers,
//         restaurant
//       )
//     )
//     .filter((item): item is Item => item !== null);

//   return [
//     ...processedTransactionItems,
//     ...processedSuggestedItems.slice(
//       0,
//       Math.max(0, 5 - processedTransactionItems.length)
//     ),
//   ].slice(0, 5);
// };
