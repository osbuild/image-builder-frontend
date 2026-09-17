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
  hostname: undefined,
  firewall: {
    ports: [],
    services: {
      enabled: [],
      disabled: [],
    },
  },
  firstboot: {},
  users: [],
  groups: [{ name: '' }],
};
