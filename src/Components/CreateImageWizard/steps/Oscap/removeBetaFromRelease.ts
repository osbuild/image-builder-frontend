import {
  RHEL_10,
  RHEL_10_BETA,
  RHEL_9,
  RHEL_9_BETA,
} from '../../../../constants';
import { Distributions } from '../../../../store/imageBuilderApi';

// The beta releases won't have any oscap profiles associated with them,
// so just use the ones from the major release.
export const removeBetaFromRelease = (dist: Distributions): Distributions => {
  switch (dist) {
    case RHEL_10_BETA:
      return RHEL_10 as Distributions;
    case RHEL_9_BETA:
      return RHEL_9;
    default:
      return dist;
  }
};
