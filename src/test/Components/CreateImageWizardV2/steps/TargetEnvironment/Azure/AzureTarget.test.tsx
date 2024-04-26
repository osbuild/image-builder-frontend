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

const goToAzureStep = async () => {
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

const selectAzureTarget = async () => {
  await render();
  const azureCard = await screen.findByTestId('upload-azure');
  await userEvent.click(azureCard);
  await clickNext();
};

const selectSource = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select source/i,
    })
  );

  await userEvent.click(
    await screen.findByRole('option', { name: /azureSource1/i })
  );
};

const selectResourceGroup = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select resource group/i,
    })
  );

  await userEvent.click(
    await screen.findByRole('option', { name: /myResourceGroup1/i })
  );
};

const selectManuallyEnterInformation = async () => {
  await userEvent.click(
    await screen.findByText(/manually enter the account information\./i)
  );
};

const enterTenantGuid = async () => {
  await userEvent.type(
    screen.getByRole('textbox', { name: /azure tenant guid/i }),
    'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
  );
};

const enterSubscriptionId = async () => {
  await userEvent.type(
    screen.getByRole('textbox', { name: /subscription id/i }),
    '60631143-a7dc-4d15-988b-ba83f3c99711'
  );
};

const enterResourceGroup = async () => {
  await userEvent.type(
    screen.getByRole('textbox', { name: /resource group/i }),
    'testResourceGroup'
  );
};

describe('azure image type request generated correctly', () => {
  test('using a source', async () => {
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource();
    await selectResourceGroup();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        options: {
          source_id: '666',
          resource_group: 'myResourceGroup1',
        },
        type: 'azure',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('manually entering info', async () => {
    await selectAzureTarget();
    await goToAzureStep();
    await selectManuallyEnterInformation();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        type: 'azure',
        options: {
          tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
          subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
          resource_group: 'testResourceGroup',
        },
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
