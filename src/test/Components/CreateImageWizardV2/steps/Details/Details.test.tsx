import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import { clickNext, getNextButton } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  goToRegistrationStep,
  interceptBlueprintRequest,
  render,
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

const goToDetailsStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
};

const enterBlueprintDescription = async () => {
  const blueprintDescription = await screen.findByRole('textbox', {
    name: /blueprint description/i,
  });
  await userEvent.type(blueprintDescription, 'Now with extra carmine!');
};

const goToReviewStep = async () => {
  await clickNext();
};

describe('validates name', () => {
  test('with invalid name', async () => {
    await render();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();

    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();
    await enterBlueprintName(' ');
    expect(nextButton).toBeDisabled();
  });

  test('with valid name', async () => {
    await render();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();
    await enterBlueprintName('🤣Red Velvet🤣');

    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
  });
});

describe('registration request generated correctly', () => {
  test('without description', async () => {
    await render();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();
    await enterBlueprintName();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = { ...blueprintRequest };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with description', async () => {
    await render();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();
    await enterBlueprintName();
    await enterBlueprintDescription();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      description: 'Now with extra carmine!',
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
