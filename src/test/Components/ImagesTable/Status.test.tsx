import React from 'react';

import { render, screen } from '@testing-library/react';

import { ProgressStatus } from '../../../Components/ImagesTable/Status';
import { ComposeRequest, ComposeStatus } from '../../../store/imageBuilderApi';

const request: ComposeRequest = {
  distribution: 'rhel-8',
  image_requests: [
    {
      architecture: 'aarch64',
      image_type: 'guest-image',
      upload_request: {
        type: 'aws.s3',
        options: {
          url: 'url',
        },
      },
    },
  ],
};
describe('Status', () => {
  test('progress', async () => {
    const status: ComposeStatus = {
      image_status: {
        status: 'building',
        progress: {
          done: 1,
          total: 20,
        },
      },
      request,
    };
    render(<ProgressStatus status={status} />);
    expect(await screen.findByText(/Image build in progress/)).toBeVisible();
    expect(await screen.findByText(/step 1 of 20/)).toBeVisible();
  });

  test('subprogress', async () => {
    const status: ComposeStatus = {
      image_status: {
        status: 'building',
        progress: {
          done: 1,
          total: 20,
          subprogress: {
            done: 3,
            total: 4,
          },
        },
      },
      request,
    };
    render(<ProgressStatus status={status} />);
    expect(await screen.findByText(/Image build in progress/)).toBeVisible();
    expect(await screen.findByText(/step 1 of 20/)).toBeVisible();
    expect(await screen.findByText(/(substep 3 of 4)/)).toBeVisible();
  });
});
