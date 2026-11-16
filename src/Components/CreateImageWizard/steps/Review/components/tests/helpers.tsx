import {
  ALL_CUSTOMIZATIONS,
  type CustomizationType,
  type RestrictionStrategy,
} from '@/store/api/distributions';

export const createDefaultRestrictions = (
  overrides: Partial<
    Record<CustomizationType, Partial<RestrictionStrategy>>
  > = {},
): Record<CustomizationType, RestrictionStrategy> => {
  const restrictions = {} as Record<CustomizationType, RestrictionStrategy>;
  for (const key of ALL_CUSTOMIZATIONS) {
    restrictions[key] = {
      shouldHide: false,
      ...overrides[key],
    };
  }
  return restrictions;
};
