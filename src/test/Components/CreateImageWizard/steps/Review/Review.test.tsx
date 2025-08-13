import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  clickBack,
  clickNext,
  clickRegisterLater,
  goToReview,
  renderCreateMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const selectGuestImage = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const setupWithRhel = async () => {
  await renderCreateMode();
  await selectGuestImage();
};

const setupWithCentos = async () => {
  const user = userEvent.setup();
  await renderCreateMode();
  const releaseMenu = screen.getByTestId('release_select');

  await waitFor(() => user.click(releaseMenu));
  const showOptionsButton = await screen.findByRole('option', {
    name: 'Show options for further development of RHEL',
  });
  await waitFor(() => user.click(showOptionsButton));

  const centos = await screen.findByRole('option', {
    name: 'CentOS Stream 9',
  });
  await waitFor(() => user.click(centos));
  await selectGuestImage();
};

const handleRegistration = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
};

describe('Step Review', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('has 3 buttons', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReview();
    await screen.findByRole('button', { name: /Create blueprint/ });
    await screen.findByRole('button', { name: /Back/ });
    await screen.findByRole('button', { name: /Cancel/ });
  });

  test('clicking Back loads Image name', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReview();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Details',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReview();
    await verifyCancelButton(router);
  });

  test('has Registration expandable section for rhel', async () => {
    await setupWithRhel();
    await handleRegistration();
    await goToReview();

    await screen.findByRole('heading', { name: /Review/ });
    const registrationExpandable = await screen.findByTestId(
      'registration-expandable',
    );
    await within(registrationExpandable).findByText('Registration type');
    await within(registrationExpandable).findByText(
      'Register the system later',
    );
  });

  test('has no Registration expandable for centos', async () => {
    await setupWithCentos();
    await goToReview();

    await screen.findByRole('heading', { name: /Review/ });
    expect(
      screen.queryByTestId('registration-expandable'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Registration type')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Register the system later'),
    ).not.toBeInTheDocument();
  });
});
