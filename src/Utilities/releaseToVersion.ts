import { CENTOS_8, CENTOS_9, RHEL_8, RHEL_9 } from '../constants';

export const releaseToVersion = (release: string) => {
  switch (release) {
    case RHEL_9:
      return '9';
    case RHEL_8:
      return '8';
    case CENTOS_9:
      return '9';
    case CENTOS_8:
      return '8';
    default:
      return '';
  }
};
