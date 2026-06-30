import {
  OpenScap,
  OpenScapCompliance,
  OpenScapProfile,
} from '@/store/api/backend';

export const isOpenScapProfile = (
  openscap: OpenScap,
): openscap is OpenScapProfile => {
  return 'profile_id' in openscap && openscap.profile_id !== '';
};

export const isCompliancePolicy = (
  openscap: OpenScap,
): openscap is OpenScapCompliance => {
  return 'policy_id' in openscap && openscap.policy_id !== '';
};
