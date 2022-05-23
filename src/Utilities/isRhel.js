import { RHEL_8, RHEL_9 } from '../constants';

function isRhel(distro) {
  switch (distro) {
    case RHEL_8:
    case RHEL_9:
      return true;
    default:
      return false;
  }
}

export default isRhel;
