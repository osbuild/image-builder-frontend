import { SystemSlice } from './types';

export const initialState: SystemSlice = {
  services: {
    enabled: [],
    masked: [],
    disabled: [],
  },
  kernel: {
    name: '',
    append: [],
  },
  locale: {
    languages: ['C.UTF-8'],
    keyboard: '',
  },
  timezone: {
    timezone: '',
    ntpservers: [],
  },
  hostname: '',
  firewall: {
    ports: [],
    services: {
      enabled: [],
      disabled: [],
    },
  },
  firstBoot: { script: '' },
  users: [],
  groups: [{ name: '' }],
};
