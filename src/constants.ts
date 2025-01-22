import type { ImageTypes } from './store/imageBuilderApi';

export const IMAGE_BUILDER_API = '/api/image-builder/v1';
export const RHSM_API = '/api/rhsm/v2';
export const EDGE_API = '/api/edge/v1';
export const CONTENT_SOURCES_API = '/api/content-sources/v1';
export const PROVISIONING_API = '/api/provisioning/v1';
export const COMPLIANCE_API = '/api/compliance/v2';
export const CREATE_BLUEPRINT = `${IMAGE_BUILDER_API}/blueprints`;
export const EDIT_BLUEPRINT = `${IMAGE_BUILDER_API}/blueprints`;

export const CDN_PROD_URL = 'https://cdn.redhat.com/';
export const CDN_STAGE_URL = 'https://cdn.stage.redhat.com/';
export const CONTENT_URL = '/insights/content/repositories';
export const DEVELOPERS_URL = 'https://developers.redhat.com/about';
export const FILE_SYSTEM_CUSTOMIZATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index#creating-a-blueprint_creating-blueprints-and-blueprint-images';
export const SUBSCRIPTION_MANAGEMENT_URL =
  'https://access.redhat.com/management/subscriptions';
export const INSIGHTS_URL =
  'https://access.redhat.com/products/red-hat-insights';
export const RHC_URL = 'https://access.redhat.com/articles/rhc';
export const RELEASE_LIFECYCLE_URL =
  'https://access.redhat.com/support/policy/updates/errata';
export const AZURE_AUTH_URL =
  'https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow';
export const COMPLIANCE_PROD_URL =
  'https://console.redhat.com/insights/compliance/scappolicies';
export const COMPLIANCE_STAGE_URL =
  'https://console.stage.redhat.com/insights/compliance/scappolicies';
export const ACTIVATION_KEYS_PROD_URL =
  'https://console.redhat.com/insights/connector/activation-keys';
export const ACTIVATION_KEYS_STAGE_URL =
  'https://console.stage.redhat.com/insights/connector/activation-keys';
export const COMPLIANCE_AND_VULN_SCANNING_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/6/html/security_guide/chap-compliance_and_vulnerability_scanning';
export const CREATING_IMAGES_WITH_IB_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index';
export const MANAGING_WITH_DNF_URL =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index';
export const CREATING_IMAGES_WITH_IB_SERVICE_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index';
export const OSTREE_URL = 'https://ostreedev.github.io/ostree/';
export const DOCUMENTATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/index';
export const CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL =
  'https://docs.redhat.com/en/documentation/edge_management/2022/html/create_rhel_for_edge_images_and_configure_automated_management/index';
export const OSBUILD_SERVICE_ARCHITECTURE_URL =
  'https://osbuild.org/docs/service/architecture/';
export const GENERATING_SSH_KEY_PAIRS_URL =
  'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_using-secure-communications-between-two-systems-with-openssh_configuring-basic-system-settings#generating-ssh-key-pairs_assembly_using-secure-communications-between-two-systems-with-openssh';

export const RHEL_8 = 'rhel-8';
export const RHEL_9 = 'rhel-9';
export const RHEL_9_BETA = 'rhel-9-beta';
export const RHEL_10 = 'rhel-10';
export const RHEL_10_BETA = 'rhel-10-beta';
export const CENTOS_9 = 'centos-9';
export const CENTOS_10 = 'centos-10';
export const FEDORA_40 = 'fedora-40';
export const FEDORA_41 = 'fedora-41';
export const X86_64 = 'x86_64';
export const AARCH64 = 'aarch64';

export const targetOptions: { [key in ImageTypes]: string } = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  'edge-commit': 'Edge Commit',
  'edge-installer': 'Edge Installer',
  gcp: 'Google Cloud Platform',
  'guest-image': 'Virtualization - Guest image',
  'image-installer': 'Bare metal - Installer',
  vsphere: 'VMware vSphere',
  'vsphere-ova': 'VMware vSphere',
  wsl: 'Windows Subsystem for Linux',
  ami: 'Amazon Web Services',
  'rhel-edge-commit': 'RHEL Edge Commit',
  'rhel-edge-installer': 'RHEL Edge Installer',
  vhd: '',
  oci: 'Oracle Cloud Infrastructure',
};

export const UNIT_KIB = 1024 ** 1;
export const UNIT_MIB = 1024 ** 2;
export const UNIT_GIB = 1024 ** 3;

// Use a Map() to ensure order is preserved (order is not gauranteed by an Object())
export const RELEASES = new Map([
  [RHEL_9, 'Red Hat Enterprise Linux (RHEL) 9'],
  [RHEL_8, 'Red Hat Enterprise Linux (RHEL) 8'],
  [RHEL_9_BETA, 'Red Hat Enterprise Linux (RHEL) 9 Beta'],
  [RHEL_10_BETA, 'Red Hat Enterprise Linux (RHEL) 10 Beta'],
  [CENTOS_9, 'CentOS Stream 9'],
]);

export const ON_PREM_RELEASES = new Map([
  [CENTOS_10, 'CentOS Stream 10'],
  [FEDORA_40, 'Fedora Linux 40'],
  [FEDORA_41, 'Fedora Linux 41'],
  [RHEL_10_BETA, 'Red Hat Enterprise Linux (RHEL) 10 Beta'],
  [RHEL_10, 'Red Hat Enterprise Linux (RHEL) 10'],
]);

export const RHEL_9_FULL_SUPPORT = ['2022-05-18', '2027-05-31'];
export const RHEL_8_FULL_SUPPORT = ['2019-05-07', '2024-05-31'];
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

export const AWS_S3_EXPIRATION_TIME_IN_HOURS = 6;
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

export const DEBOUNCED_SEARCH_WAIT_TIME = 500;
export const UNIQUE_VALIDATION_DELAY: number = 300;

export const FIRST_BOOT_SERVICE_DATA = btoa(`[Unit]
Description=Custom first boot script
ConditionFileIsExecutable=/usr/local/sbin/custom-first-boot
ConditionPathExists=!/var/local/.custom-first-boot-done
Wants=network-online.target
After=network-online.target
After=osbuild-first-boot.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/custom-first-boot
ExecStartPost=/usr/bin/touch /var/local/.custom-first-boot-done
RemainAfterExit=yes

[Install]
WantedBy=basic.target
WantedBy=multi-user.target
WantedBy=graphical.target
`);

export const FIRST_BOOT_SERVICE = 'custom-first-boot';

// For use when calling content API (now required)
export enum ContentOrigin {
  'REDHAT' = 'red_hat',
  'EXTERNAL' = 'external', // custom only
  'UPLOAD' = 'upload', // custom upload repo
  'CUSTOM' = 'external,upload',
  'ALL' = 'red_hat,external,upload',
}

export const AMPLITUDE_MODULE_NAME = 'imageBuilder';

export const PAGINATION_OFFSET = 0;
export const PAGINATION_LIMIT = 10;
export const PAGINATION_COUNT = 0;
export const SEARCH_INPUT = '';

export const BLUEPRINTS_DIR = '.cache/cockpit-image-builder/';
