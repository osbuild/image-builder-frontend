import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { azureCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  clickRegisterLater,
  enterResourceGroup,
  enterSubscriptionId,
  enterTenantGuid,
  getNextButton,
  getResourceGroupTextInput,
  getSubscriptionIdInput,
  getTenantGuidInput,
  goToReview,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

// The router is just initiliazed here, it's assigned a value in the tests
let router: RemixRouter | undefined = undefined;

const goToAzureStep = async () => {
  await clickNext();
};

const goToReviewStep = async () => {
  await clickNext(); // Register
  await clickRegisterLater();
  await goToReview();
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId(
    'target-environments-expandable',
  );
  const revisitButton = await within(expandable).findByTestId(
    'revisit-target-environments',
  );
  await waitFor(() => user.click(revisitButton));
};

const selectAzureTarget = async () => {
  const user = userEvent.setup();
  const azureCard = await screen.findByRole('button', {
    name: /Microsoft Azure/i,
  });
  await waitFor(() => user.click(azureCard));
  await clickNext();
};

const deselectAzureAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const azureCard = await screen.findByRole('button', {
    name: /Microsoft Azure/i,
  });
  await waitFor(() => user.click(azureCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectV1 = async () => {
  const user = userEvent.setup();
  const hypervMenu = screen.getByRole('button', { name: /Generation 2/i });

  await waitFor(() => user.click(hypervMenu));
  const v1 = await screen.findByRole('option', {
    name: /generation 1/i,
  });
  await waitFor(() => user.click(v1));
};

describe('Step Upload to Azure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register systems using this image',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await verifyCancelButton(router);
  });

  test('basics work', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();

    const tenantId = await getTenantGuidInput();
    expect(tenantId).toHaveValue('');
    expect(tenantId).toBeEnabled();
    await enterTenantGuid();

    const subscription = await getSubscriptionIdInput();
    expect(subscription).toHaveValue('');
    expect(subscription).toBeEnabled();
    await enterSubscriptionId();

    const resourceGroup = await getResourceGroupTextInput();
    expect(resourceGroup).toHaveValue('');
    expect(resourceGroup).toBeEnabled();
    await enterResourceGroup();

    expect(nextButton).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('Azure image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('manually entering info', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await goToReviewStep();
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
          hyper_v_generation: 'V2',
        },
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('manually entering info V1', async () => {
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await selectV1();
    await goToReviewStep();
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
          hyper_v_generation: 'V1',
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
    await renderCreateMode();
    await selectAzureTarget();
    await goToAzureStep();
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await clickBack();
    await deselectAzureAndSelectGuestImage();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('Azure edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['azure'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = azureCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
