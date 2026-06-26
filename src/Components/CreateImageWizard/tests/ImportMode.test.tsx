import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import {
  ONPREM_BLUEPRINT_TOML,
  ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES,
} from '@/Components/Blueprints/tests/mocks';
import {
  clearWithWait,
  clickWithWait,
  composeHandlers,
  createArchitecturesHandler,
  createUser,
  typeWithWait,
} from '@/test/testUtils';

import {
  renderImportMode,
  selectGuestImage,
  selectRegisterLater,
} from './helpers';
import {
  createDefaultFetchHandler,
  fetchMock,
  mockArchitectures,
} from './mocks';

describe('ImportMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(
      composeHandlers(
        createArchitecturesHandler({ architectures: mockArchitectures }),
        createDefaultFetchHandler(),
      ),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('renders wizard in import mode', async () => {
    await renderImportMode(ONPREM_BLUEPRINT_TOML);

    const heading = await screen.findByRole('heading', {
      name: /build an image/i,
    });

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });
    const baseNavItem = within(navigation).getByRole('button', {
      name: /base settings/i,
    });

    expect(heading).toBeInTheDocument();
    expect(baseNavItem).toBeEnabled();
  });

  test('imports TOML blueprint with all customizations', async () => {
    const user = createUser();
    await renderImportMode(ONPREM_BLUEPRINT_TOML);

    const nextButton = await screen.findByRole('button', { name: /Next/i });
    const clickNext = () => clickWithWait(user, nextButton);

    await selectGuestImage(user);
    await clickNext();

    await selectRegisterLater(user);
    await clickNext();

    // Packages
    await screen.findByRole('heading', { name: /Repositories and packages/i });
    await screen.findByText('tmux');
    await screen.findByText('openssh-server');
    await clickNext();

    // File system
    const partitionsTable = await screen.findByRole('grid', {
      name: /file system table/i,
    });
    expect(
      await within(partitionsTable).findByDisplayValue('/var'),
    ).toBeInTheDocument();
    expect(
      within(partitionsTable).getByRole('cell', { name: /2/i }),
    ).toBeInTheDocument();

    // Timezone
    await screen.findByRole('heading', { name: 'Time' });
    await screen.findByRole('button', { name: 'US/Eastern' });
    await screen.findByText(/^0\.north-america\.pool/i);
    await screen.findByText(/^1\.north-america\.pool/i);

    // Locale
    await screen.findByRole('heading', { name: /Locale/ });
    await screen.findByRole('button', {
      name: 'English - United States (en_US.UTF-8)',
    });
    await screen.findByRole('button', {
      name: 'Japanese - Japan (ja_JP.UTF-8)',
    });
    await screen.findByRole('button', { name: 'us' });

    // Hostname
    expect(await screen.findByPlaceholderText(/Add a hostname/i)).toHaveValue(
      'base-image',
    );

    // Kernel
    await screen.findByRole('button', { name: /kernel-debug/i });
    await screen.findByText('nosmt=force');

    // Firewall
    await screen.findByText('22:tcp');
    await screen.findByText('80:tcp');
    await screen.findByText('imap:tcp');
    await screen.findByText('telnet');
    await screen.findByText('ftp');
    await screen.findByText('ntp');

    // Services
    await screen.findByText('sshd');
    await screen.findByText('cockpit.socket');
    await screen.findByText('httpd');
    await screen.findByText('postfix');
    await screen.findByText('telnetd');
    await screen.findByText('rpcbind');
  });

  test('renders errors for invalid values from TOML', async () => {
    const user = createUser();
    await renderImportMode(ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES);

    const nextButton = await screen.findByRole('button', { name: /Next/i });
    const clickNext = () => clickWithWait(user, nextButton);

    await selectGuestImage(user);
    await clickNext();

    await selectRegisterLater(user);
    await clickNext();

    // Packages step - nothing to check/fix
    await clickNext();

    // File system configuration
    expect(
      await screen.findByText(/The Wizard only supports MiB or GiB/),
    ).toBeInTheDocument();

    // Timezone
    expect(await screen.findByText('Unknown timezone')).toBeInTheDocument();
    expect(
      await screen.findByText('Invalid NTP servers: invalid-ntp-server'),
    ).toBeInTheDocument();

    const timezoneToggle = await screen.findByRole('button', {
      name: 'invalid-timezone',
    });
    await clickWithWait(user, timezoneToggle);

    const timezoneOptions = await screen.findAllByRole('menuitem');
    expect(timezoneOptions[0]).toHaveTextContent(/Etc\/UTC.*Default/i);

    const searchInput = await screen.findByLabelText(/Filter timezone/i);
    await typeWithWait(user, searchInput, 'Etc/UTC');
    await clickWithWait(
      user,
      await screen.findByRole('menuitem', {
        name: /Etc\/UTC/i,
      }),
    );

    await clickWithWait(
      user,
      await screen.findByRole('button', {
        name: /remove invalid-ntp-server/i,
      }),
    );

    // Locale
    expect(
      await screen.findByText('Unknown languages: invalid-language'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Unknown keyboard')).toBeInTheDocument();

    await clickWithWait(
      user,
      await screen.findByRole('button', {
        name: /remove language/i,
      }),
    );

    const keyboardToggle = await screen.findByRole('button', {
      name: 'invalid-keyboard',
    });
    await clickWithWait(user, keyboardToggle);
    const keyboardSearch = await screen.findByLabelText(/search by name/i);
    await typeWithWait(user, keyboardSearch, 'us');
    await clickWithWait(
      user,
      await screen.findByRole('menuitem', { name: 'us' }),
    );

    // Hostname
    expect(await screen.findByText(/Invalid hostname/)).toBeInTheDocument();
    await clearWithWait(
      user,
      screen.getByRole('textbox', {
        name: /hostname input/i,
      }),
    );

    // Kernel
    expect(
      await screen.findByText(/Invalid kernel arguments/),
    ).toBeInTheDocument();
    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove invalid\$kernel\$argument/i,
      }),
    );

    // Firewall
    expect(
      await screen.findByText(/Invalid ports: invalid-port/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid disabled services: --invalid-firewall-disabled-service/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid enabled services: --invalid-firewall-enabled-service/,
      ),
    ).toBeInTheDocument();

    await clickWithWait(
      user,
      screen.getByRole('button', { name: /remove invalid-port/i }),
    );
    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove --invalid-firewall-disabled-service/i,
      }),
    );
    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove --invalid-firewall-enabled-service/i,
      }),
    );

    // Services
    expect(
      await screen.findByText(
        /Invalid enabled services: --invalid-enabled-service/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid disabled services: --invalid-disabled-service/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid masked services: --invalid-masked-service/,
      ),
    ).toBeInTheDocument();

    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove --invalid-enabled-service/i,
      }),
    );
    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove --invalid-disabled-service/i,
      }),
    );
    await clickWithWait(
      user,
      screen.getByRole('button', {
        name: /remove --invalid-masked-service/i,
      }),
    );
  }, 20000);
});
