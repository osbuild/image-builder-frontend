import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { gcpCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickBack, clickNext } from '../../../../testUtils';
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
  await renderCreateMode();
  const googleOption = await screen.findByTestId('upload-google');
  await userEvent.click(googleOption);
  await clickNext();
};

const deselectGcpAndSelectGuestImage = async () => {
  const googleCard = await screen.findByTestId('upload-google');
  await userEvent.click(googleCard);
  await userEvent.click(
    await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    })
  );
  await clickNext();
};

const selectGoogleAccount = async (optionId: string) => {
  const googleAccountOption = await screen.findByTestId(optionId);
  await userEvent.click(googleAccountOption);
  const principalInput = await screen.findByTestId('principal');
  await userEvent.type(principalInput, GCP_ACCOUNT);
};

describe('gcp image type request generated correctly', () => {
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
    await clickGCPTarget();
    const shareWithInsightOption = await screen.findByTestId(
      'share-with-insights'
    );

    await userEvent.click(shareWithInsightOption);
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
  test('edit mode works', async () => {
    const id = mockBlueprintIds['gcp'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = gcpCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
