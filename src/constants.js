export const IMAGE_BUILDER_API = '/api/image-builder/v1';
export const RHSM_API = '/api/rhsm/v2';
export const CONTENT_SOURCES = '/api/content-sources/v1';
export const RHEL_8 = 'rhel-86';
export const RHEL_9 = 'rhel-90';

export const UNIT_KIB = 1024 ** 1;
export const UNIT_MIB = 1024 ** 2;
export const UNIT_GIB = 1024 ** 3;

export const RELEASES = {
  [RHEL_8]: 'Red Hat Enterprise Linux (RHEL) 8',
  [RHEL_9]: 'Red Hat Enterprise Linux (RHEL) 9',
  'centos-8': 'CentOS Stream 8',
  'centos-9': 'CentOS Stream 9',
};

export const DEFAULT_AWS_REGION = 'us-east-1';

// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
export const AWS_REGIONS = [
  { description: 'US East (Ohio)', value: 'us-east-2' },
  { description: 'US East (N. Virginia)', value: 'us-east-1' },
  { description: 'US West (N. California)', value: 'us-west-1' },
  { description: 'US West (Oregon)', value: 'us-west-2' },
  { description: 'Africa (Cape Town)', value: 'af-south-1' },
  { description: 'Asia Pacific (Hong Kong)', value: 'ap-east-1' },
  { description: 'Asia Pacific (Jakarta)', value: 'ap-southeast-3' },
  { description: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
  { description: 'Asia Pacific (Osaka)', value: 'ap-northeast-3' },
  { description: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
  { description: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  { description: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
  { description: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  { description: 'Canada (Central)', value: 'ca-central-1' },
  { description: 'Europe (Frankfurt)', value: 'eu-central-1' },
  { description: 'Europe (Ireland)', value: 'eu-west-1' },
  { description: 'Europe (London)', value: 'eu-west-2' },
  { description: 'Europe (Milan)', value: 'eu-south-1' },
  { description: 'Europe (Paris)', value: 'eu-west-3' },
  { description: 'Europe (Stockholm)', value: 'eu-north-1' },
  { description: 'Middle East (Bahrain)', value: 'me-south-1' },
  { description: 'Middle East (UAE)', value: 'me-central-1' },
  { description: 'South America (S\u00e3o Paolo)', value: 'sa-east-1' },
];

export const AWS_S3_EXPIRATION_TIME_IN_HOURS = 6;
