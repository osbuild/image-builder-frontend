import { screen } from '@testing-library/react';

import { createUser, typeWithWait } from '@/test/testUtils';

import {
  addNtpServer,
  openTimezoneDropdown,
  removeNtpServer,
  renderTimezoneStep,
  selectTimezoneOption,
  typeTimezone,
} from './helpers';

// Mock the large timezone list with smaller test data for faster tests
vi.mock('../timezonesList', () => ({
  timezones: [
    'Etc/UTC',
    'Europe/Amsterdam',
    'Europe/London',
    'Europe/Oslo',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
  ],
}));

describe('Timezone Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderTimezoneStep();

      expect(
        await screen.findByRole('heading', { name: 'Time' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Select a timezone and define NTP servers/i),
      ).toBeInTheDocument();
    });

    test('displays timezone dropdown and NTP servers input', async () => {
      renderTimezoneStep();

      expect(
        await screen.findByRole('button', { name: /Select a timezone/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Add NTP servers/i),
      ).toBeInTheDocument();
    });

    test('displays timezone helper text', async () => {
      renderTimezoneStep();

      expect(
        await screen.findByText(
          /Network time servers for system clock synchronization/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays NTP servers helper text', async () => {
      renderTimezoneStep();

      expect(
        await screen.findByText(
          /Specify NTP servers by hostname or IP address/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Timezone Selection', () => {
    test('shows timezone options when dropdown is opened', async () => {
      renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);

      expect(
        screen.getByRole('menuitem', { name: /Etc\/UTC/i }),
      ).toBeInTheDocument();
    });

    test('can select a timezone', async () => {
      renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);
      await selectTimezoneOption(user, /Europe\/Amsterdam/i);

      expect(
        await screen.findByRole('button', { name: 'Europe/Amsterdam' }),
      ).toBeInTheDocument();
    });

    test('filters timezones by search term', async () => {
      renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);
      await typeTimezone(user, 'Europe');

      expect(
        screen.getByRole('menuitem', { name: /Europe\/Amsterdam/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /Europe\/London/i }),
      ).toBeInTheDocument();
    });

    test('shows no results for unknown timezone', async () => {
      renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);
      await typeTimezone(user, 'foo');

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();

      const option = await screen.findByRole('menuitem', {
        name: /no results found/i,
      });
      expect(option).toBeDisabled();
    });

    test('shows default label for Etc/UTC timezone', async () => {
      renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);

      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('NTP Servers', () => {
    test('can add an NTP server', async () => {
      renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, '0.nl.pool.ntp.org');

      expect(screen.getByText('0.nl.pool.ntp.org')).toBeInTheDocument();
    });

    test('can add multiple NTP servers', async () => {
      renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, '0.nl.pool.ntp.org');
      await addNtpServer(user, '1.nl.pool.ntp.org');

      expect(screen.getByText('0.nl.pool.ntp.org')).toBeInTheDocument();
      expect(screen.getByText('1.nl.pool.ntp.org')).toBeInTheDocument();
    });

    test('can remove an NTP server', async () => {
      renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, '0.nl.pool.ntp.org');
      await screen.findByText('0.nl.pool.ntp.org');

      await removeNtpServer(user, '0.nl.pool.ntp.org');

      expect(screen.queryByText('0.nl.pool.ntp.org')).not.toBeInTheDocument();
    });

    test('shows error for duplicate NTP server', async () => {
      renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, '0.nl.pool.ntp.org');
      await addNtpServer(user, '0.nl.pool.ntp.org');

      expect(
        screen.getByText('NTP server already exists.'),
      ).toBeInTheDocument();
    });

    test('shows error for invalid NTP server format', async () => {
      renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, 'this is not NTP server');

      expect(
        screen.getByText(
          'Expected format: <ntp-server>. Example: time.redhat.com',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated timezone from state', async () => {
      renderTimezoneStep({
        timezone: {
          timezone: 'Europe/Amsterdam',
          ntpservers: [],
        },
      });

      expect(
        await screen.findByRole('button', { name: 'Europe/Amsterdam' }),
      ).toBeInTheDocument();
    });

    test('renders with pre-populated NTP servers from state', async () => {
      renderTimezoneStep({
        timezone: {
          timezone: 'Etc/UTC',
          ntpservers: ['0.nl.pool.ntp.org', '1.nl.pool.ntp.org'],
        },
      });

      expect(screen.getByText('0.nl.pool.ntp.org')).toBeInTheDocument();
      expect(screen.getByText('1.nl.pool.ntp.org')).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when timezone is selected', async () => {
      const { store } = renderTimezoneStep();
      const user = createUser();

      expect(store.getState().wizard.timezone.timezone).toBe('');

      await openTimezoneDropdown(user);
      await selectTimezoneOption(user, /Europe\/Amsterdam/i);

      expect(store.getState().wizard.timezone.timezone).toBe(
        'Europe/Amsterdam',
      );
    });

    test('updates store when NTP server is added', async () => {
      const { store } = renderTimezoneStep();
      const user = createUser();

      expect(store.getState().wizard.timezone.ntpservers).toHaveLength(0);

      await addNtpServer(user, '0.nl.pool.ntp.org');

      expect(store.getState().wizard.timezone.ntpservers).toContain(
        '0.nl.pool.ntp.org',
      );
    });

    test('updates store when multiple NTP servers are added', async () => {
      const { store } = renderTimezoneStep();
      const user = createUser();

      await addNtpServer(user, '0.nl.pool.ntp.org');
      await addNtpServer(user, '1.nl.pool.ntp.org');

      const ntpservers = store.getState().wizard.timezone.ntpservers;
      expect(ntpservers).toContain('0.nl.pool.ntp.org');
      expect(ntpservers).toContain('1.nl.pool.ntp.org');
    });

    test('updates store when NTP server is removed', async () => {
      const { store } = renderTimezoneStep({
        timezone: {
          timezone: 'Etc/UTC',
          ntpservers: ['0.nl.pool.ntp.org'],
        },
      });
      const user = createUser();

      expect(store.getState().wizard.timezone.ntpservers).toContain(
        '0.nl.pool.ntp.org',
      );

      await removeNtpServer(user, '0.nl.pool.ntp.org');

      expect(store.getState().wizard.timezone.ntpservers).not.toContain(
        '0.nl.pool.ntp.org',
      );
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in timezone search does not trigger page reload', async () => {
      const { store } = renderTimezoneStep();
      const user = createUser();

      await openTimezoneDropdown(user);

      const searchInput = await screen.findByLabelText(/Filter timezone/i);
      await typeWithWait(user, searchInput, 'Europe{Enter}');

      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('Europe');
      expect(store.getState().wizard.timezone.timezone).toBe('');
    });
  });
});
