import type {
  GetOscapCustomizationsApiResponse,
  GetOscapProfilesApiResponse,
} from '@/store/api/backend';

export const mockOscapProfiles: GetOscapProfilesApiResponse = [
  'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
  'xccdf_org.ssgproject.content_profile_cis_workstation_l2',
  'xccdf_org.ssgproject.content_profile_standard',
  'xccdf_org.ssgproject.content_profile_stig_gui',
  'xccdf_org.ssgproject.content_profile_ccn_basic',
];

export const mockOscapCustomizations: GetOscapCustomizationsApiResponse = {
  filesystem: [
    { min_size: 1073741824, mountpoint: '/tmp' },
    { min_size: 1073741824, mountpoint: '/home' },
  ],
  openscap: {
    profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
    profile_name:
      'CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
    profile_description:
      'This is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  packages: ['aide', 'neovim'],
  kernel: {
    append: 'audit_backlog_limit=8192 audit=1',
  },
  services: {
    masked: ['nfs-server', 'emacs-service'],
    disabled: ['rpcbind', 'autofs', 'nftables'],
    enabled: ['crond', 'neovim-service'],
  },
};
