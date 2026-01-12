import type { ImageTypes } from './store/imageBuilderApi';

export const IMAGE_BUILDER_API = '/api/image-builder/v1';
export const RHSM_API = '/api/rhsm/v2';
export const CONTENT_SOURCES_API = '/api/content-sources/v1';
export const PROVISIONING_API = '/api/provisioning/v1';
export const COMPLIANCE_API = '/api/compliance/v2';
export const CREATE_BLUEPRINT = `${IMAGE_BUILDER_API}/blueprints`;
export const EDIT_BLUEPRINT = `${IMAGE_BUILDER_API}/blueprints`;

export const CDN_PROD_URL = 'https://cdn.redhat.com/';
export const CDN_STAGE_URL = 'https://cdn.stage.redhat.com/';
export const CONTENT_URL = '/insights/content/repositories';
export const TEMPLATES_URL = '/insights/content/templates';
export const DEVELOPERS_URL = 'https://developers.redhat.com/about';
export const FILE_SYSTEM_CUSTOMIZATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index#creating-a-blueprint_creating-blueprints-and-blueprint-images';
export const PARTITIONING_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_image_mode_for_rhel_to_build_deploy_and_manage_operating_systems/customizing-disk-images-of-rhel-image-mode-with-advanced-partitioning_using-image-mode-for-rhel-to-build-deploy-and-manage-operating-systems';
export const SUBSCRIPTION_MANAGEMENT_URL =
  'https://access.redhat.com/management/subscriptions';
export const INSIGHTS_URL =
  'https://access.redhat.com/products/red-hat-insights';
export const RHC_URL = 'https://access.redhat.com/articles/rhc';
export const RELEASE_LIFECYCLE_URL =
  'https://access.redhat.com/support/policy/updates/errata';
export const AZURE_AUTH_URL =
  'https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow';
export const COMPLIANCE_URL = '/insights/compliance/scappolicies';
export const OSCAP_URL =
  'https://www.open-scap.org/resources/documentation/perform-vulnerability-scan-of-rhel-6-machine/';
export const ACTIVATION_KEYS_URL = !process.env.IS_ON_PREMISE
  ? '/insights/connector/activation-keys'
  : 'https://console.redhat.com/settings/connector/activation-keys';
export const COMPLIANCE_AND_VULN_SCANNING_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/6/html/security_guide/chap-compliance_and_vulnerability_scanning';
export const MANAGING_WITH_DNF_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index';
export const IB_HOSTED_LIGHTSPEED_DOCUMENTATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index';
export const IB_ON_PREMISE_RHEL9_DOCUMENTATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/composing_a_customized_rhel_system_image/index';
export const IB_ON_PREMISE_RHEL10_DOCUMENTATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/composing_a_customized_rhel_system_image/image-builder-description';
export const IB_ON_PREMISE_OSBUILD_DOCUMENTATION_URL =
  'https://osbuild.org/docs/user-guide/introduction/';
export const OSBUILD_SERVICE_ARCHITECTURE_URL =
  'https://osbuild.org/docs/service/architecture/';
export const GENERATING_SSH_KEY_PAIRS_URL =
  'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_using-secure-communications-between-two-systems-with-openssh_configuring-basic-system-settings#generating-ssh-key-pairs_assembly_using-secure-communications-between-two-systems-with-openssh';
export const REGISTRATION_DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_satellite/6.16/html-single/managing_hosts/index#Customizing_the_Registration_Templates_managing-hosts';
export const AAP_DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/deploying_and_managing_rhel_systems_in_hybrid_clouds/index#additional-modifications-to-a-blueprint_creating-blueprints-and-blueprint-images';

export const FIRSTBOOT_PATH = '/usr/local/sbin/custom-first-boot';
export const FIRSTBOOT_SERVICE_PATH =
  '/etc/systemd/system/custom-first-boot.service';
export const SATELLITE_PATH = '/usr/local/sbin/register-satellite';
export const SATELLITE_SERVICE_PATH =
  '/etc/systemd/system/register-satellite.service';

export const RHEL_8 = 'rhel-8';
export const RHEL_9 = 'rhel-9';
export const RHEL_9_BETA = 'rhel-9-beta';
export const RHEL_10 = 'rhel-10';
export const RHEL_10_BETA = 'rhel-10-beta';
export const CENTOS_9 = 'centos-9';
export const CENTOS_10 = 'centos-10';
export const FEDORA_41 = 'fedora-41';
export const FEDORA_42 = 'fedora-42';
export const FEDORA_43 = 'fedora-43';
export const FEDORA_44 = 'fedora-44';
export const IMAGE_MODE = 'image-mode';
export const X86_64 = 'x86_64';
export const AARCH64 = 'aarch64';

export const targetOptions: { [key in ImageTypes]: string } = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  'edge-commit': 'Edge Commit',
  'edge-installer': 'Edge Installer',
  gcp: 'Google Cloud',
  'guest-image': 'Virtualization - Guest image',
  'image-installer': 'Bare metal - Installer',
  'network-installer': 'Network - Installer',
  vsphere: 'VMware vSphere',
  'vsphere-ova': 'VMware vSphere',
  wsl: 'Windows Subsystem for Linux',
  ami: 'Amazon Web Services',
  'rhel-edge-commit': 'RHEL Edge Commit',
  'rhel-edge-installer': 'RHEL Edge Installer',
  vhd: '',
  oci: 'Oracle Cloud Infrastructure',
  'pxe-tar-xz': '',
};

export const UNIT_KIB = 1024 ** 1;
export const UNIT_MIB = 1024 ** 2;
export const UNIT_GIB = 1024 ** 3;

// Use a Map() to ensure order is preserved (order is not gauranteed by an Object())
export const RELEASES = new Map([
  [RHEL_10, 'Red Hat Enterprise Linux (RHEL) 10'],
  [RHEL_9, 'Red Hat Enterprise Linux (RHEL) 9'],
  [RHEL_8, 'Red Hat Enterprise Linux (RHEL) 8'],
  [CENTOS_9, 'CentOS Stream 9'],
  [CENTOS_10, 'CentOS Stream 10'],
]);

export const ON_PREM_RELEASES = new Map([
  [CENTOS_10, 'CentOS Stream 10'],
  [FEDORA_41, 'Fedora Linux 41'],
  [FEDORA_42, 'Fedora Linux 42'],
  [FEDORA_43, 'Fedora Linux 43'],
  [FEDORA_44, 'Fedora Linux 44'],
  [RHEL_9, 'Red Hat Enterprise Linux (RHEL) 9'],
  [RHEL_10, 'Red Hat Enterprise Linux (RHEL) 10'],
]);

export const RHEL_10_IMAGE_MODE = {
  name: 'Red Hat Enterprise Linux (RHEL) 10',
  reference: 'registry.redhat.io/rhel10/rhel-bootc:10.1',
};

export const RHEL_9_IMAGE_MODE = {
  name: 'Red Hat Enterprise Linux (RHEL) 9',
  reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
};

// Container images for image mode, pinned to specific stable versions
export const IMAGE_MODE_RELEASES = new Map([
  [RHEL_10, RHEL_10_IMAGE_MODE],
  [RHEL_9, RHEL_9_IMAGE_MODE],
]);

export const IMAGE_MODE_RELEASE_LOOKUP = {
  [RHEL_10_IMAGE_MODE.reference]: RHEL_10_IMAGE_MODE.name,
  [RHEL_9_IMAGE_MODE.reference]: RHEL_9_IMAGE_MODE.name,
};

export const RHEL_10_FULL_SUPPORT = ['2025-05-13', '2030-05-31'];
export const RHEL_9_FULL_SUPPORT = ['2022-05-18', '2027-05-31'];
export const RHEL_8_FULL_SUPPORT = ['2019-05-07', '2024-05-31'];
export const RHEL_10_MAINTENANCE_SUPPORT = ['2030-05-31', '2035-05-31'];
export const RHEL_9_MAINTENANCE_SUPPORT = ['2027-05-31', '2032-05-31'];
export const RHEL_8_MAINTENANCE_SUPPORT = ['2024-05-31', '2029-05-31'];

export const ARCHES = [X86_64, AARCH64];

export const DEFAULT_AWS_REGION = 'us-east-1';

// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
export const AWS_REGIONS = [
  { description: 'US East (Ohio)', value: 'us-east-2', disableRegion: false },
  {
    description: 'US East (N. Virginia)',
    value: 'us-east-1',
    // disable default region
    disableRegion: true,
  },
  {
    description: 'US West (N. California)',
    value: 'us-west-1',
    disableRegion: false,
  },
  { description: 'US West (Oregon)', value: 'us-west-2', disableRegion: false },
  {
    description: 'Africa (Cape Town)',
    value: 'af-south-1',
    disableRegion: true,
  },
  {
    description: 'Asia Pacific (Hong Kong)',
    value: 'ap-east-1',
    disableRegion: true,
  },
  {
    description: 'Asia Pacific (Jakarta)',
    value: 'ap-southeast-3',
    disableRegion: true,
  },
  {
    description: 'Asia Pacific (Mumbai)',
    value: 'ap-south-1',
    disableRegion: false,
  },
  {
    description: 'Asia Pacific (Osaka)',
    value: 'ap-northeast-3',
    disableRegion: false,
  },
  {
    description: 'Asia Pacific (Seoul)',
    value: 'ap-northeast-2',
    disableRegion: false,
  },
  {
    description: 'Asia Pacific (Singapore)',
    value: 'ap-southeast-1',
    disableRegion: false,
  },
  {
    description: 'Asia Pacific (Sydney)',
    value: 'ap-southeast-2',
    disableRegion: false,
  },
  {
    description: 'Asia Pacific (Tokyo)',
    value: 'ap-northeast-1',
    disableRegion: false,
  },
  {
    description: 'Canada (Central)',
    value: 'ca-central-1',
    disableRegion: false,
  },
  {
    description: 'Europe (Frankfurt)',
    value: 'eu-central-1',
    disableRegion: false,
  },
  { description: 'Europe (Ireland)', value: 'eu-west-1', disableRegion: false },
  { description: 'Europe (London)', value: 'eu-west-2', disableRegion: false },
  { description: 'Europe (Milan)', value: 'eu-south-1', disableRegion: true },
  { description: 'Europe (Paris)', value: 'eu-west-3', disableRegion: false },
  {
    description: 'Europe (Stockholm)',
    value: 'eu-north-1',
    disableRegion: false,
  },
  {
    description: 'Middle East (Bahrain)',
    value: 'me-south-1',
    disableRegion: true,
  },
  {
    description: 'Middle East (UAE)',
    value: 'me-central-1',
    disableRegion: true,
  },
  {
    description: 'South America (S\u00e3o Paolo)',
    value: 'sa-east-1',
    disableRegion: false,
  },
];

export const AWS_S3_EXPIRATION_TIME_IN_HOURS = 168; // 7 days
export const AWS_S3_EXPIRATION_TIME_IN_HOURS_LEGACY = 6; // Legacy 6 hours expiration
export const OCI_STORAGE_EXPIRATION_TIME_IN_DAYS = 7;

// Anchor element for all modals that we display so that they play nice with top-most components like Quickstarts
export const MODAL_ANCHOR = '.pf-c-page.chr-c-page';

export const STATUS_POLLING_INTERVAL = 8000;

export const RH_ICON_SIZE = 16;

export const EPEL_8_REPO_DEFINITION = {
  name: 'EPEL 8 Everything x86_64',
  url: 'https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/',
  distribution_versions: ['8'],
  distribution_arch: 'x86_64',
  gpg_key:
    '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBFz3zvsBEADJOIIWllGudxnpvJnkxQz2CtoWI7godVnoclrdl83kVjqSQp+2\ndgxuG5mUiADUfYHaRQzxKw8efuQnwxzU9kZ70ngCxtmbQWGmUmfSThiapOz00018\n+eo5MFabd2vdiGo1y+51m2sRDpN8qdCaqXko65cyMuLXrojJHIuvRA/x7iqOrRfy\na8x3OxC4PEgl5pgDnP8pVK0lLYncDEQCN76D9ubhZQWhISF/zJI+e806V71hzfyL\n/Mt3mQm/li+lRKU25Usk9dWaf4NH/wZHMIPAkVJ4uD4H/uS49wqWnyiTYGT7hUbi\necF7crhLCmlRzvJR8mkRP6/4T/F3tNDPWZeDNEDVFUkTFHNU6/h2+O398MNY/fOh\nyKaNK3nnE0g6QJ1dOH31lXHARlpFOtWt3VmZU0JnWLeYdvap4Eff9qTWZJhI7Cq0\nWm8DgLUpXgNlkmquvE7P2W5EAr2E5AqKQoDbfw/GiWdRvHWKeNGMRLnGI3QuoX3U\npAlXD7v13VdZxNydvpeypbf/AfRyrHRKhkUj3cU1pYkM3DNZE77C5JUe6/0nxbt4\nETUZBTgLgYJGP8c7PbkVnO6I/KgL1jw+7MW6Az8Ox+RXZLyGMVmbW/TMc8haJfKL\nMoUo3TVk8nPiUhoOC0/kI7j9ilFrBxBU5dUtF4ITAWc8xnG6jJs/IsvRpQARAQAB\ntChGZWRvcmEgRVBFTCAoOCkgPGVwZWxAZmVkb3JhcHJvamVjdC5vcmc+iQI4BBMB\nAgAiBQJc9877AhsPBgsJCAcDAgYVCAIJCgsEFgIDAQIeAQIXgAAKCRAh6kWrL4bW\noWagD/4xnLWws34GByVDQkjprk0fX7Iyhpm/U7BsIHKspHLL+Y46vAAGY/9vMvdE\n0fcr9Ek2Zp7zE1RWmSCzzzUgTG6BFoTG1H4Fho/7Z8BXK/jybowXSZfqXnTOfhSF\nalwDdwlSJvfYNV9MbyvbxN8qZRU1z7PEWZrIzFDDToFRk0R71zHpnPTNIJ5/YXTw\nNqU9OxII8hMQj4ufF11040AJQZ7br3rzerlyBOB+Jd1zSPVrAPpeMyJppWFHSDAI\nWK6x+am13VIInXtqB/Cz4GBHLFK5d2/IYspVw47Solj8jiFEtnAq6+1Aq5WH3iB4\nbE2e6z00DSF93frwOyWN7WmPIoc2QsNRJhgfJC+isGQAwwq8xAbHEBeuyMG8GZjz\nxohg0H4bOSEujVLTjH1xbAG4DnhWO/1VXLX+LXELycO8ZQTcjj/4AQKuo4wvMPrv\n9A169oETG+VwQlNd74VBPGCvhnzwGXNbTK/KH1+WRH0YSb+41flB3NKhMSU6dGI0\nSGtIxDSHhVVNmx2/6XiT9U/znrZsG5Kw8nIbbFz+9MGUUWgJMsd1Zl9R8gz7V9fp\nn7L7y5LhJ8HOCMsY/Z7/7HUs+t/A1MI4g7Q5g5UuSZdgi0zxukiWuCkLeAiAP4y7\nzKK4OjJ644NDcWCHa36znwVmkz3ixL8Q0auR15Oqq2BjR/fyog==\n=84m8\n-----END PGP PUBLIC KEY BLOCK-----',
  metadata_verification: false,
};

export const EPEL_9_REPO_DEFINITION = {
  name: 'EPEL 9 Everything x86_64',
  url: 'https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64/',
  distribution_versions: ['9'],
  distribution_arch: 'x86_64',
  gpg_key:
    '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGE3mOsBEACsU+XwJWDJVkItBaugXhXIIkb9oe+7aadELuVo0kBmc3HXt/Yp\nCJW9hHEiGZ6z2jwgPqyJjZhCvcAWvgzKcvqE+9i0NItV1rzfxrBe2BtUtZmVcuE6\n2b+SPfxQ2Hr8llaawRjt8BCFX/ZzM4/1Qk+EzlfTcEcpkMf6wdO7kD6ulBk/tbsW\nDHX2lNcxszTf+XP9HXHWJlA2xBfP+Dk4gl4DnO2Y1xR0OSywE/QtvEbN5cY94ieu\nn7CBy29AleMhmbnx9pw3NyxcFIAsEZHJoU4ZW9ulAJ/ogttSyAWeacW7eJGW31/Z\n39cS+I4KXJgeGRI20RmpqfH0tuT+X5Da59YpjYxkbhSK3HYBVnNPhoJFUc2j5iKy\nXLgkapu1xRnEJhw05kr4LCbud0NTvfecqSqa+59kuVc+zWmfTnGTYc0PXZ6Oa3rK\n44UOmE6eAT5zd/ToleDO0VesN+EO7CXfRsm7HWGpABF5wNK3vIEF2uRr2VJMvgqS\n9eNwhJyOzoca4xFSwCkc6dACGGkV+CqhufdFBhmcAsUotSxe3zmrBjqA0B/nxIvH\nDVgOAMnVCe+Lmv8T0mFgqZSJdIUdKjnOLu/GRFhjDKIak4jeMBMTYpVnU+HhMHLq\nuDiZkNEvEEGhBQmZuI8J55F/a6UURnxUwT3piyi3Pmr2IFD7ahBxPzOBCQARAQAB\ntCdGZWRvcmEgKGVwZWw5KSA8ZXBlbEBmZWRvcmFwcm9qZWN0Lm9yZz6JAk4EEwEI\nADgWIQT/itE0RZcQbs6BO5GKOHK/MihGfAUCYTeY6wIbDwULCQgHAgYVCgkICwIE\nFgIDAQIeAQIXgAAKCRCKOHK/MihGfFX/EACBPWv20+ttYu1A5WvtHJPzwbj0U4yF\n3zTQpBglQ2UfkRpYdipTlT3Ih6j5h2VmgRPtINCc/ZE28adrWpBoeFIS2YAKOCLC\nnZYtHl2nCoLq1U7FSttUGsZ/t8uGCBgnugTfnIYcmlP1jKKA6RJAclK89evDQX5n\nR9ZD+Cq3CBMlttvSTCht0qQVlwycedH8iWyYgP/mF0W35BIn7NuuZwWhgR00n/VG\n4nbKPOzTWbsP45awcmivdrS74P6mL84WfkghipdmcoyVb1B8ZP4Y/Ke0RXOnLhNe\nCfrXXvuW+Pvg2RTfwRDtehGQPAgXbmLmz2ZkV69RGIr54HJv84NDbqZovRTMr7gL\n9k3ciCzXCiYQgM8yAyGHV0KEhFSQ1HV7gMnt9UmxbxBE2pGU7vu3CwjYga5DpwU7\nw5wu1TmM5KgZtZvuWOTDnqDLf0cKoIbW8FeeCOn24elcj32bnQDuF9DPey1mqcvT\n/yEo/Ushyz6CVYxN8DGgcy2M9JOsnmjDx02h6qgWGWDuKgb9jZrvRedpAQCeemEd\nfhEs6ihqVxRFl16HxC4EVijybhAL76SsM2nbtIqW1apBQJQpXWtQwwdvgTVpdEtE\nr4ArVJYX5LrswnWEQMOelugUG6S3ZjMfcyOa/O0364iY73vyVgaYK+2XtT2usMux\nVL469Kj5m13T6w==\n=Mjs/\n-----END PGP PUBLIC KEY BLOCK-----',
  metadata_verification: false,
};

export const EPEL_10_REPO_DEFINITION = {
  name: 'EPEL 10 Everything x86_64',
  url: 'https://dl.fedoraproject.org/pub/epel/10/Everything/x86_64/',
  distribution_versions: ['10'],
  distribution_arch: 'x86_64',
  gpg_key:
    '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGV4X6kBEAC3eQxgiWuo08uc3mHo4ELux++uqTnYz/tJzEf9Ou3h36WnhumA\nNvs+Ts5h8PBx879Y9/aIX1Z20p1kf6tBCinZnEJu59n+TAAsph0+XQlV1l5YkleK\nZ2ff/Fg65k8QcLXWaIGykA/FaKznRiSurGuD6tRGhJw7DawEwBJr8QZSkRUpnH1L\nURW97Q/iKrRPiE5VEayE0y8eAL28jIIiFvR+4oJMzvCsRRB/2wYZ2MlJOW91hcYf\nmbUoXKOBD5UzsJylu7kj25K/ge8rEJ7KicOOwcdYddxsU3DxGSSfwF8AMagENcm2\nXROeXknjm84A8sNlUkFZBJwfuc7eRTiZGJrnQQVYLrkKj8Mxpq9Ts7hU51TqAWNI\nuvGDlJdYNE3D2RMqjMEsZ8ej08Thrib6xslu4NzTBkt+6QNnXL4E3hEgYtoyio60\nGswSz2ulogKg7X4JrNdJYE8/qNowyF3hoVgj5TG1/wQRq+5HlMMOLjgGu9wzLUix\nfnVfEUnzaofbrUf4/GabCaeY8xRe4tFQrvzigQ4g+kgwKKnfAeqBmPov0yljkw9z\nBYJWR5zvaw0ffg9Ing00KUSaXBXA5jSlgk1603Y+LefY1SlXsTyqohiRvGH6FI77\nHNMo72DwoJfFcYjncZUzKgXWJECR4nhVsdj6pKoOjcQ4aSuyVxtsR86ASQARAQAB\ntChGZWRvcmEgKGVwZWwxMCkgPGVwZWxAZmVkb3JhcHJvamVjdC5vcmc+iQJOBBMB\nCAA4FiEEfY0Vy/xOYmiFkfsmM9mFF+N+0VgFAmV4X6kCGw8FCwkIBwIGFQoJCAsC\nBBYCAwECHgECF4AACgkQM9mFF+N+0Vhv/A/+PlhPLSctGRCUEahE+cN4764Acc3p\nl40ZYzXRhqR0/Tc1/cSDjlA3qVTc8SPohi5OJXwCyr9EiMqKoyoDN097euqbYpyp\nyN/Pj0lBjsXwcpdDtZ21WGeQU0Khb04N68bMtJbDaxeBciTvDDQravZuPPh0m4Rg\nZ6myEoa6Aa6EK0hI1Qwi1qIWeRiuEkVT671IaKVETBW5XiUpNBXDAB/L+6DzUF9u\nscBzfsUDiPO6NrpYDtV3jwq22y6gWluIct/Ka8brwPbqK2sBfFzrHboRhfqlTGjs\n7F9qUGwIQZn/A8iozXZYQ0+JG1bhQyvjA8eN1GOcRpT+O7H7JXN49o6IG2As4+iK\nF04+qjqAu2sVfpD8mzM2VubFNllcKKiyCzRYHhSbObRCPzsudDL9GPiXeGGaCuWg\nsDkiA1MESvf2tLETAGBs/TziO4GwmXUtlKbRiq1FYm90mVq9mBxPZ/Idn+yZusNB\n0O5SXIbI8lYZw5n4XTK4b+byHRBYsOTHiTsGvjTF2Y7oSwW2CVUmL6RZ23mI4qoY\n1p5kzRS+GjT1acnTei/FTsOlIKCsjfeHx7uxCkX6xpAD8P3UtLQqfsgH0CL4vSZt\nTGO6L1InQlp4ZG3OYIomTKbD3/R0wod3U3dTqdulQMXL895u6OLTY3spY2m2MO2k\np9Dfd2pKuxK9Mys=\n=mhQZ\n-----END PGP PUBLIC KEY BLOCK-----',
  metadata_verification: false,
};

export const DEBOUNCED_SEARCH_WAIT_TIME = 500;
export const UNIQUE_VALIDATION_DELAY: number = 300;

export const FIRST_BOOT_SERVICE_DATA = btoa(`[Unit]
Description=Custom first boot script
ConditionFileIsExecutable=${FIRSTBOOT_PATH}
ConditionPathExists=!/var/local/.custom-first-boot-done
Wants=network-online.target
After=selinux-autorelabel.service
After=network-online.target
After=osbuild-first-boot.service
After=register-satellite.service
After=aap-first-boot-reg.service

[Service]
Type=oneshot
ExecStart=${FIRSTBOOT_PATH}
ExecStartPost=/usr/bin/touch /var/local/.custom-first-boot-done
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
`);

export const FIRST_BOOT_SERVICE = 'custom-first-boot';

export const SATELLITE_SERVICE_DATA = btoa(`[Unit]
Description=Register satellite first boot script
ConditionFileIsExecutable=${SATELLITE_PATH}
ConditionPathExists=!/var/local/.register-satellite-done
Wants=network-online.target
After=selinux-autorelabel.service
After=network-online.target
After=osbuild-first-boot.service

[Service]
Type=oneshot
ExecStart=/bin/bash -x ${SATELLITE_PATH}
ExecStartPost=/usr/bin/touch /var/local/.register-satellite-done
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
`);

export const SATELLITE_SERVICE = 'register-satellite';

// For use when calling content API (now required)
export enum ContentOrigin {
  'REDHAT' = 'red_hat',
  'EXTERNAL' = 'external', // custom only
  'UPLOAD' = 'upload', // custom upload repo
  'COMMUNITY' = 'community', // shared epel repos
  'CUSTOM' = 'external,upload',
  'ALL' = 'red_hat,external,upload',
}

export const AMPLITUDE_MODULE_NAME = 'imageBuilder';

export const PAGINATION_OFFSET = 0;
export const PAGINATION_LIMIT = 10;
export const PAGINATION_COUNT = 0;
export const SEARCH_INPUT = '';

export const BLUEPRINTS_DIR = 'cockpit-image-builder';
