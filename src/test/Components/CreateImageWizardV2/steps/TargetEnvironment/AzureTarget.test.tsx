import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import nodeFetch, { Request, Response } from 'node-fetch';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { azureCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickBack, clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

Object.assign(global, { fetch: nodeFetch, Request, Response });

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
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

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn(() => false),
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
  await clickNext(); // FirstBoot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectAzureTarget = async () => {
  await renderCreateMode();
  const azureCard = await screen.findByTestId('upload-azure');
  await userEvent.click(azureCard);
  await clickNext();
};

const deselectAzureAndSelectGuestImage = async () => {
  const azureCard = await screen.findByTestId('upload-azure');
  await userEvent.click(azureCard);
  await userEvent.click(
    await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    })
  );
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
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
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

  test('after selecting and deselecting azure', async () => {
    await selectAzureTarget();
    await goToAzureStep();
    await selectSource();
    await clickBack();
    await deselectAzureAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('Azure edit mode', () => {
  test('edit mode works', async () => {
    const id = mockBlueprintIds['azure'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = azureCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
