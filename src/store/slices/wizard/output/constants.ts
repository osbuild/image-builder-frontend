export const RHEL_DISTRIBUTIONS = [
  'rhel-8',
  'rhel-9',
  'rhel-9-beta',
  'rhel-10',
  'rhel-10-beta',
] as const;

export const PUBLIC_CLOUD_TYPES = [
  'aws',
  'ami',
  'azure',
  'gcp',
  'oci',
  'vhd',
] as const;

export const PRIVATE_CLOUD_TYPES = ['vsphere', 'vsphere-ova'] as const;

export const EDGE_TYPES = [
  'edge-commit',
  'edge-installer',
  'rhel-edge-commit',
  'rhel-edge-installer',
] as const;

export const S3_UPLOAD_OPTIONS = {
  upload_request: {
    type: 'aws.s3' as const,
    options: {},
  },
};

export const OCI_UPLOAD_OPTIONS = {
  upload_request: {
    type: 'oci.objectstorage' as const,
    options: {},
  },
};
