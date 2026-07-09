import type { BootcDistributionItem } from '@/store/api/backend';

export type GroupedDistribution = {
  name: string;
  items: BootcDistributionItem[];
};

export const groupByName = (
  distributions: BootcDistributionItem[],
): GroupedDistribution[] => {
  const groups = new Map<string, BootcDistributionItem[]>();
  for (const item of distributions) {
    const existing = groups.get(item.name);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.name, [item]);
    }
  }
  return Array.from(groups, ([name, items]) => ({ name, items }));
};
