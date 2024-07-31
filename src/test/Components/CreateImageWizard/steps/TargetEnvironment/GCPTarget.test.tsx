import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { gcpCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  clickBack,
  clickNext,
  getNextButton,
  verifyCancelButton,
} from '../../wizardTestUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  imageRequest,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const GCP_ACCOUNT = 'test@gmail.com';

const goToReview = async () => {
  await clickNext();
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Details
  await clickNext(); // FirstBoot
  await enterBlueprintName();
  await clickNext(); // Review
};

const createGCPCloudImage = (
  image_type: ImageTypes,
  options: GcpUploadRequestOptions
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
  await renderCreateMode();
  const googleOption = await screen.findByTestId('upload-google');
  await waitFor(() => user.click(googleOption));
  await clickNext();
};

const deselectGcpAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const googleCard = await screen.findByTestId('upload-google');
  await waitFor(() => user.click(googleCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectGoogleAccount = async (optionId: string) => {
  const user = userEvent.setup();
  const googleAccountOption = await screen.findByTestId(optionId);
  await waitFor(() => user.click(googleAccountOption));
  const principalInput = await screen.findByTestId('principal');
  await waitFor(() => user.type(principalInput, GCP_ACCOUNT));
};

let router: RemixRouter | undefined = undefined;
const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
];

describe('Step Upload to Google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    // select gcp as upload destination
    const uploadGcp = await screen.findByTestId('upload-google');

    user.click(uploadGcp);

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Google Cloud Platform',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();

    const shareRadioButton = await screen.findByText(
      /share image with a google account/i
    );
    user.click(shareRadioButton);

    const googleEmailInput = await screen.findByTestId('principal');

    await waitFor(() => user.type(googleEmailInput, 'test@test.com'));
    await clickNext();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    await screen.findByText(
      'Automatically register and enable advanced capabilities'
    );
  });

  test('clicking Back loads Release', async () => {
    await setUp();

    await clickBack();

    await screen.findByTestId('upload-google');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('the google account id field is shown and required', async () => {
    await setUp();

    const principalInput = await screen.findByTestId('principal');
    expect(principalInput).toHaveValue('');
    expect(principalInput).toBeEnabled();
  });

  test('the google email field must be a valid email', async () => {
    await setUp();

    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'a')
    );
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();
    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'test@test.com')
    );
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });
});

describe('gcp image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('share image with google account', async () => {
    await clickGCPTarget();
    await selectGoogleAccount('google-account');
    await goToReview();
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
    await clickGCPTarget();
    await selectGoogleAccount('service-account');
    await goToReview();
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
    await clickGCPTarget();
    await selectGoogleAccount('google-group');
    await goToReview();
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
    await clickGCPTarget();
    await selectGoogleAccount('google-domain');
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {
      share_with_accounts: [`domain:${GCP_ACCOUNT}`],
    });
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });
  test('share image with red hat insight only', async () => {
    const user = userEvent.setup();
    await clickGCPTarget();
    const shareWithInsightOption = await screen.findByTestId(
      'share-with-insights'
    );

    user.click(shareWithInsightOption);
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedImageRequest = createGCPCloudImage('gcp', {});
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting gcp', async () => {
    await clickGCPTarget();
    await selectGoogleAccount('google-domain');
    await clickBack();
    await deselectGcpAndSelectGuestImage();
    await goToReview();
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
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = gcpCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
