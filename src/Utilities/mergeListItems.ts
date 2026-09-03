export type MergedListItem = { value: string; required: boolean };

export const mergeListItems = (
  requiredItems: string[],
  optionalItems: string[],
): MergedListItem[] => [
  ...requiredItems.map((item) => ({ value: item, required: true })),
  ...optionalItems
    .filter((item) => !requiredItems.includes(item))
    .map((item) => ({ value: item, required: false })),
];
