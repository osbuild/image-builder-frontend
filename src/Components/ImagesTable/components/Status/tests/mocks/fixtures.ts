import type { ComposeRequest } from '@/store/api/backend';

export const mockComposeRequest: ComposeRequest = {
  distribution: 'rhel-8',
  image_requests: [
    {
      architecture: 'aarch64',
      image_type: 'guest-image',
      upload_request: {
        type: 'aws.s3',
        options: {
          url: 's3://bucket/key',
        },
      },
    },
  ],
};
