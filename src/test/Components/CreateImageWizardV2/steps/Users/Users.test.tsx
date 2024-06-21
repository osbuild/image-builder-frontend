import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import { clickNext, getNextButton } from '../../../../testUtils';
import {
  defaultSshKey,
  userRequest,
  clickRegisterLater,
  goToRegistrationStep,
  interceptBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
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

const goToUsersStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
};

const enterUserName = async (name: undefined | string = undefined) => {
  const nameField = await screen.findByRole('textbox', {
    name: /ssh key/i,
  });
  name ||= 'jdoe';
  await userEvent.type(nameField, name);
};

const enterSshKey = async (sshKey: undefined | string = undefined) => {
  const sshKeyField = await screen.findByRole('textbox', {
    name: /ssh key/i,
  });
  sshKey ||= defaultSshKey;
  await userEvent.type(sshKeyField, sshKey);
};

const goToReviewStep = async () => {
  await clickNext();
};

describe('validates the name and key', () => {
  test('with invalid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();

    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();
    await enterSshKey();
    await enterUserName('*');
    expect(nextButton).toBeDisabled();
  });

  test('with valid name and key', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await enterUserName();
    await enterSshKey();

    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
  });
});

describe('request generated correctly', () => {
  test('with user', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToUsersStep();
    await enterUserName();
    await enterSshKey();
    await clickNext();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = { ...userRequest };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
