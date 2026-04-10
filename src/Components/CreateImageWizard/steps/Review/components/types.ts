import {
  CustomizationType,
  RestrictionStrategy,
} from '@/store/api/distributions';

export type ReviewCardProps = {
  restrictions: Record<CustomizationType, RestrictionStrategy>;
};

export type Hideable = {
  shouldHide: boolean;
};
