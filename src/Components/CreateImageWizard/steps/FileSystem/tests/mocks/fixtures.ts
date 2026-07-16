import type { GetOscapCustomizationsApiResponse } from '@/store/api/backend';

export const mockOscapProfile =
  'xccdf_org.ssgproject.content_profile_cis_workstation_l1';

export const mockOscapCustomizations: GetOscapCustomizationsApiResponse = {
  openscap: {
    profile_id: mockOscapProfile,
    profile_name:
      'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Workstation',
    profile_description: 'Mock OpenSCAP profile for testing',
  },
  packages: ['aide'],
  filesystem: [
    { mountpoint: '/', min_size: 10737418240 },
    { mountpoint: '/home', min_size: 1073741824 },
    { mountpoint: '/var', min_size: 5368709120 },
  ],
};
