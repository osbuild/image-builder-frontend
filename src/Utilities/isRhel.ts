import { RHEL_8, RHEL_9, RHEL_9_BETA } from '../constants';

function isRhel(distro: string) {
  switch (distro) {
    case RHEL_8:
    case RHEL_9:
    case RHEL_9_BETA:
      return true;
    default:
      return false;
  }
}

export default isRhel;
