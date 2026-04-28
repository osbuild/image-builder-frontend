import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CreateBlueprintRequest, ImageRequest } from '@/store/api/backend';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { awsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickRegisterLater,
  clickReviewImage,
  enterBlueprintName,
  getNextButton,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const heading = screen.getByRole('heading', { name: 'Image overview' });
  // eslint-disable-next-line testing-library/no-node-access
  const card = heading.closest('.pf-v6-c-card') as HTMLElement;
  const editButton = within(card).getByRole('button', { name: /Edit/i });
  await waitFor(() => user.click(editButton));
};

const selectAwsTarget = async () => {
  const user = userEvent.setup();
  const awsCheckbox = await screen.findByRole('checkbox', {
    name: /Amazon Web Services/i,
  });
  await waitFor(() => user.click(awsCheckbox));
};

const deselectAwsAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const awsCheckbox = await screen.findByRole('checkbox', {
    name: /Amazon Web Services/i,
  });
  await waitFor(() => user.click(awsCheckbox));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const enterAccountId = async () => {
  const user = userEvent.setup();
  const awsAccountIdTextbox = await screen.findByRole('textbox', {
    name: 'aws account id',
  });
  await waitFor(async () => user.type(awsAccountIdTextbox, '123123123123'));
};

let router: RemixRouter | undefined = undefined;

describe('Step Upload to AWS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Registration', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await enterAccountId();
    await screen.findByRole('heading', {
      name: 'Register',
    });
  });

  test('clicking Back loads Image output', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await clickBack();
    await screen.findByRole('heading', { name: 'Image output' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await verifyCancelButton(router);
  });

  test('validation works', async () => {
    await renderCreateMode();
    await selectAwsTarget();

    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();

    await enterAccountId();
    expect(nextButton).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await enterAccountId();
    await clickReviewImage();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Base settings/ });
  });
});

describe('AWS image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('using an account id', async () => {
    await renderCreateMode();
    await selectAwsTarget();
    await enterBlueprintName();
    await clickRegisterLater();
    await enterAccountId();
    await clickReviewImage();
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
    await renderCreateMode();
    await selectAwsTarget();
    await enterAccountId();
    await enterBlueprintName();
    await clickRegisterLater();
    await deselectAwsAndSelectGuestImage();
    await clickReviewImage();
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
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = awsCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
