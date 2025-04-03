import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
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
  selectGuestImageTarget,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const validUserName = 'best';
const validSshKey = 'ssh-rsa d';
const validPassword = 'validPassword';
const invalidPassword = 'inval';

const goToUsersStep = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
};

const goToReviewStep = async () => {
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const addAzureTarget = async () => {
  const user = userEvent.setup();
  await waitFor(() => user.click(screen.getByTestId('upload-azure')));
  await clickNext();

  const azureSourceDropdown = await screen.findByPlaceholderText(
    /select source/i
  );
  await waitFor(() => user.click(azureSourceDropdown));
  const azureSource = await screen.findByRole('option', {
    name: /azureSource1/i,
  });
  await waitFor(() => user.click(azureSource));

  const resourceGroupDropdown = await screen.findByPlaceholderText(
    /select resource group/i
  );
  await waitFor(() => user.click(resourceGroupDropdown));
  await waitFor(async () =>
    user.click(await screen.findByLabelText('Resource group myResourceGroup1'))
  );
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('users-expandable');
  const revisitButton = await within(expandable).findByTestId('revisit-users');
  await waitFor(() => user.click(revisitButton));
};

const clickAddUser = async () => {
  const user = userEvent.setup();
  const addUser = await screen.findByRole('button', { name: /add a user/i });
  expect(addUser).toBeEnabled();
  await waitFor(() => user.click(addUser));
};

const clickRemoveUser = async () => {
  const user = userEvent.setup();
  const removeUser = await screen.findByRole('button', { name: /close tab/i });
  expect(removeUser).toBeEnabled();
  await waitFor(() => user.click(removeUser));
  const removeUserModalButton = await screen.findByRole('button', {
    name: /Remove user/,
  });
  await waitFor(() => user.click(removeUserModalButton));
};

const addSshKey = async (sshKey: string) => {
  const user = userEvent.setup();
  const enterSshKey = await screen.findByRole('textbox', {
    name: /public SSH key/i,
  });
  await waitFor(() => user.type(enterSshKey, sshKey));
  await waitFor(() => expect(enterSshKey).toHaveValue(sshKey));
};

const addUserName = async (userName: string) => {
  const user = userEvent.setup();
  const enterUserName = screen.getByRole('textbox', {
    name: /blueprint user name/i,
  });
  await waitFor(() => user.type(enterUserName, userName));
  await waitFor(() => expect(enterUserName).toHaveValue(userName));
};

const addPassword = async (mockPassword: string) => {
  const user = userEvent.setup();
  const enterPassword = screen.getByPlaceholderText(/enter password/i);
  await waitFor(() => user.type(enterPassword, mockPassword));
  await waitFor(() => expect(enterPassword).toHaveValue(mockPassword));
};

const getAdminCheckbox = async () => {
  const adminCheckbox = await screen.findByRole('checkbox', {
    name: /administrator/i,
  });
  return adminCheckbox;
};

const checkAdminCheckbox = async () => {
  const user = userEvent.setup();
  const adminCheckbox = await getAdminCheckbox();
  await waitFor(() => user.click(adminCheckbox));
};

const addUserGroup = async (group: string) => {
  const user = userEvent.setup();
  const userGroupInput = await screen.findByPlaceholderText('Add user group');
  await waitFor(() => user.click(userGroupInput));
  await waitFor(() => user.type(userGroupInput, group));
  const addGroup = await screen.findByRole('button', {
    name: /Add user group/,
  });
  await waitFor(() => user.click(addGroup));
};

const removeUserGroup = async (group: string) => {
  const user = userEvent.setup();

  const removeGroupButton = await screen.findByRole('button', {
    name: `Close ${group}`,
  });
  await waitFor(() => user.click(removeGroupButton));
};

describe('Step Users', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Timezone', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Timezone',
    });
  });

  test('clicking Back loads Additional packages', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Additional packages' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await verifyCancelButton(router);
  });

  test('with invalid name', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName('.');
    await clickNext();
    await waitFor(() => expect(screen.getByText(/invalid user name/i)));
  });

  test('with invalid SSH key', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addSshKey('ssh');
    await clickNext();
    await waitFor(() => expect(screen.getByText(/invalid ssh key/i)));
  });

  test('Azure target with invalid password', async () => {
    await renderCreateMode();
    await addAzureTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addPassword(invalidPassword);

    const invalidUserMessage = screen.getByText(
      /Password must be at least 6 characters long/i
    );
    const warningUserMessage = screen.getByText(
      /Must include at least 3 of the following: lowercase letters, uppercase letters, numbers, symbols/i
    );
    await waitFor(() => expect(invalidUserMessage));
    await waitFor(() => expect(warningUserMessage));

    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('with invalid password', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addPassword(invalidPassword);

    const invalidUserMessage = screen.getByText(
      /Password must be at least 6 characters long/i
    );
    await waitFor(() => expect(invalidUserMessage));

    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('user groups can be added and removed', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserGroup('users');
    await addUserGroup('widget');
    await removeUserGroup('users');
    expect(screen.queryByText('users')).not.toBeInTheDocument();
  });

  test('adding wheel group checks Administrator checkbox', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    const adminCheckbox = await getAdminCheckbox();

    // Adding wheel group via groups input
    await addUserGroup('wheel');
    expect(adminCheckbox).toBeChecked();

    await removeUserGroup('wheel');
    expect(adminCheckbox).not.toBeChecked();

    // Adding wheel group via Admin checkbox
    await checkAdminCheckbox();
    expect(adminCheckbox).toBeChecked();
    await screen.findByText('wheel');

    await checkAdminCheckbox();
    expect(adminCheckbox).not.toBeChecked();
    expect(screen.queryByText('wheel')).not.toBeInTheDocument();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Users/ });
  });
});

describe('User request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('add a user', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName(validUserName);
    await addSshKey(validSshKey);
    await addPassword(validPassword);
    await checkAdminCheckbox();
    await addUserGroup('users');
    await addUserGroup('widget');
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
            name: validUserName,
            ssh_key: validSshKey,
            password: validPassword,
            groups: ['wheel', 'users', 'widget'],
          },
        ],
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('remove a user', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToUsersStep();
    await clickAddUser();
    await addUserName('test');
    await addSshKey('ssh-rsa');
    await addUserGroup('users');
    await addUserGroup('widget');
    await clickRemoveUser();
    await waitFor(() => expect(screen.getByText(/add a user to your image/i)));
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {},
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
