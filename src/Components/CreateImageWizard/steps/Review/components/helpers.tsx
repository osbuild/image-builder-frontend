// this just ensures that we always have the openscap/compliance
// required items as the first in the list
export const sortOpenscapItems = (oscapItems: string[], items: string[]) => {
  return Array.from(new Set([...oscapItems, ...items]));
};
