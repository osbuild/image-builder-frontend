import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { awsCreateBlueprintRequest } from '../../../../fixtures/editMode';
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
  await clickNext(); // FirstBoot
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectAwsTarget = async () => {
  const user = userEvent.setup();
  await renderCreateMode();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  await clickNext();
};

const deselectAwsAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
  await clickNext();
};

const selectSource = async () => {
  const user = userEvent.setup();
  const sourceTexbox = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(async () => user.click(sourceTexbox));

  const sourceOption = await screen.findByRole('option', {
    name: /my_source/i,
  });
  await waitFor(async () => user.click(sourceOption));
};

const enterAccountId = async () => {
  const user = userEvent.setup();
  const manualOption = await screen.findByText(
    /manually enter an account id\./i
  );
  await waitFor(async () => user.click(manualOption));

  const awsAccountIdTextbox = await screen.findByRole('textbox', {
    name: 'aws account id',
  });
  await waitFor(async () => user.type(awsAccountIdTextbox, '123123123123'));
};

describe('aws image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('using a source', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
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

  test('after selecting and deselecting aws', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await clickBack();
    await deselectAwsAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('AWS edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['aws'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = awsCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
