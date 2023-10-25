import {
  GetOscapProfilesApiResponse,
  GetOscapCustomizationsApiResponse,
} from '../../store/imageBuilderApi';

export const distributionOscapProfiles = (): GetOscapProfilesApiResponse => {
  return ['xccdf_org.ssgproject.content_profile_cis_workstation_l1'];
};

export const oscapCustomizations = (): GetOscapCustomizationsApiResponse => {
  return {
    filesystem: [{ min_size: 1073741824, mountpoint: '/tmp' }],
    packages: [
      'aide',
      'sudo',
      'rsyslog',
      'firewalld',
      'nftables',
      'libselinux',
    ],
  };
};
