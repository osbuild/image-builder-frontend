import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { detailsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  getNextButton,
  goToRegistrationStep,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const enterBlueprintDescription = async (
  description: string = 'Now with extra carmine!',
) => {
  const user = userEvent.setup({ delay: null });
  const blueprintDescription = await screen.findByRole('textbox', {
    name: /blueprint description/i,
  });

  await waitFor(() => user.clear(blueprintDescription));
  await waitFor(() => expect(blueprintDescription).toHaveValue(''));
  await waitFor(() => user.type(blueprintDescription, description));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('image-details-expandable');
  const revisitButton =
    await within(expandable).findByTestId('revisit-details');
  await waitFor(() => user.click(revisitButton));
};

describe('Step Details', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with invalid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();
    await enterBlueprintName(' ');
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('with valid name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    await enterBlueprintName('🤣Red Velvet🤣');
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeEnabled());
  });

  test('with non-unique name', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    await enterBlueprintName('Lemon Pie');
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('name invalid for more than 100 chars', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);

    // enter invalid image name
    const invalidName = 'a'.repeat(101);
    await enterBlueprintName(invalidName);
    expect(await getNextButton()).toBeDisabled();

    // enter valid image name
    await enterBlueprintName();
    expect(await getNextButton()).toBeEnabled();
  });

  test('description invalid for more than 250', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);

    // enter invalid image description
    const invalidDescription = 'a'.repeat(251);
    await enterBlueprintDescription(invalidDescription);
    expect(await getNextButton()).toBeDisabled();

    // enter valid image description
    await enterBlueprintDescription();
    expect(await getNextButton()).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    await goToStep(/Review/);
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Details/ });
  });
});

describe('Details request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('without description', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    await enterBlueprintName();
    await goToStep(/Review/);
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = { ...blueprintRequest };

    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });

  test('with description', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await goToStep(/Details/);
    await enterBlueprintName();
    await enterBlueprintDescription();
    await goToStep(/Review/);
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['details'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = detailsCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
