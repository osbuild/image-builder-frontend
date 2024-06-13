import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { detailsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickNext, getNextButton } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  goToRegistrationStep,
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

const goToDetailsStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
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
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();

    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();
    await enterBlueprintName(' ');
    expect(nextButton).toBeDisabled();
  });

  test('with valid name', async () => {
    await renderCreateMode();
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
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToDetailsStep();
    await enterBlueprintName();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = { ...blueprintRequest };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with description', async () => {
    await renderCreateMode();
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

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Details edit mode', () => {
  test('edit mode works', async () => {
    const id = mockBlueprintIds['details'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = detailsCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
