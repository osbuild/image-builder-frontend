import {
  GetOscapProfilesApiResponse,
  GetOscapCustomizationsApiResponse,
} from '../../store/imageBuilderApi';

export const distributionOscapProfiles = (
  _distribution: string
): GetOscapProfilesApiResponse => {
  return ['xccdf_org.ssgproject.content_profile_cis_workstation_l1'];
};

export const oscapCustomizations = (
  _distribution: string,
  _profile: string
): GetOscapCustomizationsApiResponse => {
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
