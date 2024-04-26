import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  render,
} from '../../../wizardTestUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: {
      getUser: () => {
        return {
          identity: {
            internal: {
              org_id: 5,
            },
          },
        };
      },
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

const goToAwsStep = async () => {
  await clickNext();
};

const goToReview = async () => {
  await clickNext(); // Register
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectAwsTarget = async () => {
  await render();
  const awsCard = await screen.findByTestId('upload-aws');
  await userEvent.click(awsCard);
  await clickNext();
};

const selectSource = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select source/i,
    })
  );

  await userEvent.click(
    await screen.findByRole('option', { name: /my_source/i })
  );
};

const enterAccountId = async () => {
  await userEvent.click(
    await screen.findByText(/manually enter an account id\./i)
  );

  await userEvent.type(
    await screen.findByRole('textbox', {
      name: 'aws account id',
    }),
    '123123123123'
  );
};

describe('aws image type request generated correctly', () => {
  test('using a source', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_sources: ['123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('using an account id', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await enterAccountId();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_accounts: ['123123123123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
