export const getListOfDuplicates = (list: string[]) => {
  const duplicates = list.filter((item, index) => list.indexOf(item) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];

  return uniqueDuplicates;
};
