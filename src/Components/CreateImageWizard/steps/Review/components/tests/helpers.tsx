import type {
  CustomizationType,
  RestrictionStrategy,
} from '@/store/api/distributions';
import { ALL_CUSTOMIZATIONS } from '@/store/api/distributions/constants';

export const createDefaultRestrictions = (
  overrides: Partial<
    Record<CustomizationType, Partial<RestrictionStrategy>>
  > = {},
): Record<CustomizationType, RestrictionStrategy> => {
  const restrictions = {} as Record<CustomizationType, RestrictionStrategy>;
  for (const key of ALL_CUSTOMIZATIONS) {
    restrictions[key] = {
      shouldHide: false,
      required: false,
      ...overrides[key],
    };
  }
  return restrictions;
};
