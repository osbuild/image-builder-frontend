export const IMAGE_BUILDER_API = '/api/image-builder/v1';
export const RHSM_API = '/api/rhsm/v2';
export const EDGE_API = '/api/edge/v1';
export const CONTENT_SOURCES_API = '/api/content-sources/v1';
export const PROVISIONING_API = '/api/provisioning/v1';
export const RHEL_8 = 'rhel-88';
export const RHEL_9 = 'rhel-92';
export const CENTOS_8 = 'centos-8';
export const CENTOS_9 = 'centos-9';

export const UNIT_KIB = 1024 ** 1;
export const UNIT_MIB = 1024 ** 2;
export const UNIT_GIB = 1024 ** 3;

export const RELEASES = new Map([
  [RHEL_9, 'Red Hat Enterprise Linux (RHEL) 9'],
  [RHEL_8, 'Red Hat Enterprise Linux (RHEL) 8'],
  [CENTOS_9, 'CentOS Stream 9'],
  [CENTOS_8, 'CentOS Stream 8'],
]);

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

// Anchor element for all modals that we display so that they play nice with top-most components like Quickstarts
export const MODAL_ANCHOR = '.pf-c-page.chr-c-page';

export const STATUS_POLLING_INTERVAL = 8000;
