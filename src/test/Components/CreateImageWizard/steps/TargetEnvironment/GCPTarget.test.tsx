import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CreateBlueprintRequest,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
} from '@/store/api/backend';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { gcpCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  clickRegisterLater,
  getNextButton,
  goToReview,
  imageRequest,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

const GCP_ACCOUNT = 'test@gmail.com';
const GCP_DOMAIN = 'example.com';

const goToReviewStep = async () => {
  await clickNext();
  await clickRegisterLater();
  await goToReview();
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const heading = screen.getByRole('heading', { name: 'Image overview' });
  // eslint-disable-next-line testing-library/no-node-access
  const card = heading.closest('.pf-v6-c-card') as HTMLElement;
  const editButton = within(card).getByRole('button', { name: /Edit/i });
  await waitFor(() => user.click(editButton));
};

const createGCPCloudImage = (
  image_type: ImageTypes,
  options: GcpUploadRequestOptions,
): ImageRequest => {
  return {
    ...imageRequest,
    image_type,
    upload_request: {
      type: 'gcp',
      options,
    },
  };
};

const clickGCPTarget = async () => {
  const user = userEvent.setup();
  const googleCheckbox = await screen.findByRole('checkbox', {
    name: /Google Cloud/i,
  });
  await waitFor(() => user.click(googleCheckbox));
  await clickNext();
};

const deselectGcpAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const googleCheckbox = await screen.findByRole('checkbox', {
    name: /Google Cloud/i,
  });
  await waitFor(() => user.click(googleCheckbox));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectGoogleAccount = async (
  optionId: string,
  value: string = GCP_ACCOUNT,
) => {
  const user = userEvent.setup();
  const accountTypeToggle = await screen.findByRole('button', {
    name: /Google account|Select account type/i,
  });
  await waitFor(() => user.click(accountTypeToggle));
  const option = await screen.findByRole('option', { name: optionId });
  await waitFor(() => user.click(option));
  const principalInput = await screen.findByRole('textbox', {
    name: /google principal/i,
  });
  await waitFor(() => user.type(principalInput, value));
};

let router: RemixRouter | undefined = undefined;

describe('Step Upload to Google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('Google account');
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Register',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await verifyCancelButton(router);
  });

  test('the google account id field is shown and required', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    const principalInput = await screen.findByRole('textbox', {
      name: /google principal/i,
    });
    expect(principalInput).toHaveValue('');
    expect(await getNextButton()).toBeDisabled();
  });

  test('the google email field must be a valid email', async () => {
    await renderCreateMode();
    await clickGCPTarget();

    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: /google principal/i,
        }),
        'a',
      ),
    );
    expect(await getNextButton()).toBeDisabled();

    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: /google principal/i,
        }),
        'test@test.com',
      ),
    );
    expect(await getNextButton()).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('Google account');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Image output/ });
  });
});

describe('GCP image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('share image with google account', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('Google account');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`user:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with service account', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('Service account');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`serviceAccount:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with google group', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount('Google group');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`group:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('share image with domain', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount(
      'Google Workspace domain or Cloud Identity domain',
      GCP_DOMAIN,
    );
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`domain:${GCP_DOMAIN}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting gcp', async () => {
    await renderCreateMode();
    await clickGCPTarget();
    await selectGoogleAccount(
      'Google Workspace domain or Cloud Identity domain',
      GCP_DOMAIN,
    );
    await clickBack();
    await deselectGcpAndSelectGuestImage();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('GCP edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['gcp'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = gcpCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
