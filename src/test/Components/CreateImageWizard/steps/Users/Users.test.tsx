import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { usersCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  getNextButton,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';
import {
  clickRegisterLater,
  goToRegistrationStep,
  renderCreateMode,
} from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToUsersStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
};

const goToReviewStep = async () => {
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const addValidUser = async () => {
  const user = userEvent.setup();
  const addUser = await screen.findByRole('button', { name: /add a user/i });
  expect(addUser).toBeEnabled();
  await waitFor(() => user.click(addUser));
  const enterUserName = screen.getByRole('textbox', {
    name: /blueprint user name/i,
  });
  const nextButton = await getNextButton();
  await waitFor(() => user.type(enterUserName, 'best'));
  await waitFor(() => expect(enterUserName).toHaveValue('best'));
  await waitFor(() => expect(nextButton).toBeEnabled());
};

describe('Step Users', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('without adding user loads timezone', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
    await waitFor(() => user.click(nextButton));
    await screen.findByText('Select a timezone for your image.');
  });

  test('clicking Back loads Additional packages', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Additional packages' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToUsersStep();
    await verifyCancelButton(router);
  });

  describe('User request generated correctly', () => {
    test('with valid name and password', async () => {
      await renderCreateMode();
      await goToRegistrationStep();
      await clickRegisterLater();
      await goToUsersStep();
      await addValidUser();
      await goToReviewStep();
      // informational modal pops up in the first test only as it's tied
      // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
      await openAndDismissSaveAndBuildModal();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest = {
        ...blueprintRequest,
        customizations: {
          users: [
            {
              name: 'best',
            },
          ],
        },
      };

      await waitFor(() => {
        expect(receivedRequest).toEqual(expectedRequest);
      });
    });
  });

  describe('Users edit mode', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('edit mode works', async () => {
      const id = mockBlueprintIds['users'];
      await renderEditMode(id);

      // starts on review step
      const receivedRequest = await interceptEditBlueprintRequest(
        `${EDIT_BLUEPRINT}/${id}`
      );
      const expectedRequest = usersCreateBlueprintRequest;
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});
