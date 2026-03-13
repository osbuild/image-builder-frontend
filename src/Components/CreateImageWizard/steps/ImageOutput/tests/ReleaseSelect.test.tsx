import { screen, waitFor } from '@testing-library/react';

import { CENTOS_9, RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import {
  selectDistribution,
  selectRegistrationType,
} from '@/store/slices/wizard';
import { clickWithWait, createUser } from '@/test/testUtils';

import {
  expandDevelopmentOptions,
  openReleaseSelect,
  renderReleaseSelect,
  selectRelease,
} from './helpers';

describe('ReleaseSelect', () => {
  describe('Rendering', () => {
    test('renders with RHEL 10 as default', () => {
      renderReleaseSelect();

      const toggle = screen.getByTestId('release_select');
      expect(toggle).toHaveTextContent(/Red Hat Enterprise Linux \(RHEL\) 10/i);
    });

    test('renders with RHEL 9 when set in state', () => {
      renderReleaseSelect({ distribution: RHEL_9 });

      const toggle = screen.getByTestId('release_select');
      expect(toggle).toHaveTextContent(/Red Hat Enterprise Linux \(RHEL\) 9/i);
    });

    test('renders with RHEL 8 when set in state', () => {
      renderReleaseSelect({ distribution: RHEL_8 });

      const toggle = screen.getByTestId('release_select');
      expect(toggle).toHaveTextContent(/Red Hat Enterprise Linux \(RHEL\) 8/i);
    });

    test('shows required indicator', () => {
      renderReleaseSelect();

      expect(screen.getByText('Release')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Dropdown behavior', () => {
    test('opens dropdown and shows RHEL options', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);

      expect(
        screen.getByRole('option', {
          name: /Red Hat Enterprise Linux \(RHEL\) 10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /Red Hat Enterprise Linux \(RHEL\) 9/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /Red Hat Enterprise Linux \(RHEL\) 8/i,
        }),
      ).toBeInTheDocument();
    });

    test('shows "show options for further development" button', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);

      expect(
        screen.getByRole('option', {
          name: /show options for further development/i,
        }),
      ).toBeInTheDocument();
    });

    test('does not show CentOS by default', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);

      expect(
        screen.queryByRole('option', { name: /CentOS/i }),
      ).not.toBeInTheDocument();
    });

    test('shows CentOS after expanding development options', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);
      await expandDevelopmentOptions(user);

      expect(
        screen.getByRole('option', { name: /CentOS Stream 9/i }),
      ).toBeInTheDocument();
    });

    test('closes dropdown after selection', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const option = await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 9/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('State updates', () => {
    test('selecting RHEL 9 updates redux state', async () => {
      const user = createUser();
      const { store } = renderReleaseSelect();

      await selectRelease(user, /Red Hat Enterprise Linux \(RHEL\) 9/i);

      expect(selectDistribution(store.getState())).toBe(RHEL_9);
    });

    test('selecting RHEL 8 updates redux state', async () => {
      const user = createUser();
      const { store } = renderReleaseSelect();

      await selectRelease(user, /Red Hat Enterprise Linux \(RHEL\) 8/i);

      expect(selectDistribution(store.getState())).toBe(RHEL_8);
    });

    test('selecting CentOS sets registration type to register-later', async () => {
      const user = createUser();
      const { store } = renderReleaseSelect();

      await openReleaseSelect(user);
      await expandDevelopmentOptions(user);

      const centos = await screen.findByRole('option', {
        name: /CentOS Stream 9/i,
      });
      await clickWithWait(user, centos);

      expect(selectDistribution(store.getState())).toBe(CENTOS_9);
      expect(selectRegistrationType(store.getState())).toBe('register-later');
    });

    test('selecting RHEL sets registration type to register-now-rhc', async () => {
      const user = createUser();
      const { store } = renderReleaseSelect({
        distribution: CENTOS_9,
        registration: {
          registrationType: 'register-later',
          activationKey: undefined,
          orgId: undefined,
          satelliteRegistration: {
            command: undefined,
            caCert: undefined,
          },
        },
      });

      await selectRelease(user, /Red Hat Enterprise Linux \(RHEL\) 10/i);

      expect(selectDistribution(store.getState())).toBe(RHEL_10);
      expect(selectRegistrationType(store.getState())).toBe('register-now-rhc');
    });
  });

  describe('Support lifecycle descriptions', () => {
    test('shows support dates for RHEL releases', async () => {
      const user = createUser();
      renderReleaseSelect();

      await openReleaseSelect(user);

      const fullSupportTexts = screen.getAllByText(/Full support ends:/i);
      const maintenanceTexts = screen.getAllByText(
        /Maintenance support ends:/i,
      );

      expect(fullSupportTexts.length).toBeGreaterThan(0);
      expect(maintenanceTexts.length).toBeGreaterThan(0);
    });
  });
});
