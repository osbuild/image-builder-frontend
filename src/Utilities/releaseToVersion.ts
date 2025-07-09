import { CENTOS_9, RHEL_10, RHEL_8, RHEL_9 } from '../constants';

export const releaseToVersion = (release: string) => {
  switch (release) {
    case RHEL_10:
      return '10';
    case RHEL_9:
      return '9';
    case RHEL_8:
      return '8';
    case CENTOS_9:
      return '9';
    default:
      return '';
  }
};
