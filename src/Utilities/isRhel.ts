import {
  RHEL_10,
  RHEL_10_BETA,
  RHEL_8,
  RHEL_9,
  RHEL_9_BETA,
} from '../constants';

function isRhel(distro: string) {
  switch (distro) {
    case RHEL_8:
    case RHEL_9:
    case RHEL_9_BETA:
    case RHEL_10:
    case RHEL_10_BETA:
      return true;
    default:
      return false;
  }
}

export default isRhel;
