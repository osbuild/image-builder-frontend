import type { GetOscapCustomizationsApiResponse } from '@/store/api/backend';

export const mockOscapCustomizations: GetOscapCustomizationsApiResponse = {
  services: {
    masked: ['nfs-server', 'emacs-service'],
    disabled: ['rpcbind', 'autofs', 'nftables'],
    enabled: ['crond', 'neovim-service'],
  },
};
