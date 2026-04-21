import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  BLUEPRINT_JSON,
  BLUEPRINT_WITH_DISK_CUSTOMIZATION,
  BLUEPRINT_WITH_FILESYSTEM_CUSTOMIZATION,
  IGNORE_SUBSCRIPTION_BLUEPRINT,
  INVALID_ARCHITECTURE_JSON,
  INVALID_BLUEPRINT_WITH_FILESYSTEM_AND_DISK,
  INVALID_JSON,
  ONPREM_BLUEPRINT_TOML,
  ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES,
} from '../../fixtures/importBlueprints';
import { renderCustomRoutesWithReduxRouter } from '../../renderUtils';
import { clickNext, goToStep } from '../CreateImageWizard/wizardTestUtils';

const setUp = async () => {
  const user = userEvent.setup();
  renderCustomRoutesWithReduxRouter();
  const importBlueprintBtn = await screen.findByRole('button', {
    name: /Import/i,
  });
  await waitFor(() => user.click(importBlueprintBtn));
  const reviewButton = await screen.findByRole('button', {
    name: /review and finish/i,
  });
  await waitFor(() => expect(reviewButton).toBeDisabled());
};

const uploadFile = async (filename: string, content: string): Promise<void> => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([content], filename, { type: 'application/json' });
    await waitFor(() => user.upload(fileInput, file));
  }
};

describe('Import modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('renders import component', async () => {
    renderCustomRoutesWithReduxRouter();
    const importButton = await screen.findByRole('button', { name: /Import/i });
    await waitFor(() => expect(importButton).toBeInTheDocument());
  });

  test('should show alert on invalid blueprint', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_JSON);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeDisabled());
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i,
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should show alert on invalid blueprint incorrect architecture', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_ARCHITECTURE_JSON);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeDisabled());
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i,
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should enable button and ignore subscription in blueprint file', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, IGNORE_SUBSCRIPTION_BLUEPRINT);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h2' }),
      ).toBeInTheDocument(),
    );
  });

  test('should enable button on correct blueprint and go to wizard', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_JSON);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h2' }),
      ).toBeInTheDocument(),
    );
  });

  test('should enable button on toml blueprint and go to wizard', async () => {
    await setUp();
    await uploadFile(`blueprints.toml`, ONPREM_BLUEPRINT_TOML);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h2' }),
      ).toBeInTheDocument(),
    );

    // Image output - select AWS and fill in account ID (inline)
    await waitFor(
      async () =>
        await user.click(
          await screen.findByRole('checkbox', { name: /Amazon Web Services/i }),
        ),
    );
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', { name: /aws account id/i }),
        '123456789012',
      ),
    );

    // Registration
    await screen.findByText(
      'Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities.',
    );
    //const registrationCheckbox = await screen.findByRole('radio', {
    //  name: /Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities./i,
    //});
    //expect(registrationCheckbox).toHaveFocus();
    await screen.findByPlaceholderText('Select activation key');

    await clickNext(); // Repositories and packages

    // Packages
    await screen.findByText('tmux');
    await screen.findByText('openssh-server');

    await clickNext(); // Advanced settings

    // File system configuration
    const partitionsTable = await screen.findByRole('grid', {
      name: /file system table/i,
    });
    const partition = await within(partitionsTable).findByDisplayValue('/var');
    expect(partition).toBeInTheDocument();
    const sizeValue = within(partitionsTable).getByRole('cell', {
      name: /2/i,
    });
    expect(sizeValue).toBeInTheDocument();

    // Timezone
    await screen.findByRole('heading', { name: 'Time' });
    expect(
      await screen.findByRole('button', { name: 'US/Eastern' }),
    ).toBeInTheDocument();
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
    expect(
      await screen.findByRole('button', { name: 'us' }),
    ).toBeInTheDocument();

    // Hostname
    const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
    expect(hostnameInput).toHaveValue('base-image');

    // Kernel
    expect(
      await screen.findByRole('button', { name: /kernel-debug/i }),
    ).toBeInTheDocument();
    await screen.findByText('nosmt=force');

    // Firewall
    // check ports
    await screen.findByText('22:tcp');
    await screen.findByText('80:tcp');
    await screen.findByText('imap:tcp');
    // check disabled services
    await screen.findByText('telnet');
    // check enabled services
    await screen.findByText('ftp');
    await screen.findByText('ntp');

    // Services
    await screen.findByText('sshd');
    await screen.findByText('cockpit.socket');
    await screen.findByText('httpd');
    await screen.findByText('postfix');
    await screen.findByText('telnetd');
    await screen.findByText('rpcbind');
  }, 20000);

  test('should render errors for invalid values', async () => {
    await setUp();
    await uploadFile(
      `blueprints.toml`,
      ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES,
    );
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await clickNext(); // Repositories and packages
    await clickNext(); // Advanced settings

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
    await waitFor(() => user.click(timezoneToggle));

    const timezoneOptions = await screen.findAllByRole('menuitem');
    expect(timezoneOptions[0]).toHaveTextContent(/Etc\/UTC.*Default/i);

    const searchInput = await screen.findByLabelText(/Filter timezone/i);
    await waitFor(() => user.type(searchInput, 'Etc/UTC'));
    const defaultTimezone = await screen.findByRole('menuitem', {
      name: /Etc\/UTC/i,
    });
    await waitFor(() => user.click(defaultTimezone));
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /remove invalid-ntp-server/i,
        }),
      ),
    );

    // Locale
    expect(
      await screen.findByText('Unknown languages: invalid-language'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Unknown keyboard')).toBeInTheDocument();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /remove language/i,
        }),
      ),
    );
    const keyboardToggle = await screen.findByRole('button', {
      name: 'invalid-keyboard',
    });
    await waitFor(() => user.click(keyboardToggle));
    const keyboardSearch = await screen.findByLabelText(/search by name/i);
    await waitFor(() => user.type(keyboardSearch, 'us'));
    const keyboardOption = await screen.findByRole('menuitem', { name: 'us' });
    await waitFor(() => user.click(keyboardOption));

    // Hostname
    expect(await screen.findByText(/Invalid hostname/)).toBeInTheDocument();
    await waitFor(() =>
      user.clear(
        screen.getByRole('textbox', {
          name: /hostname input/i,
        }),
      ),
    );

    // Kernel
    expect(
      await screen.findByText(/Invalid kernel arguments/),
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove invalid\$kernel\$argument/i,
        }),
      ),
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
    await waitFor(() =>
      user.click(screen.getByRole('button', { name: /remove invalid-port/i })),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove --invalid-firewall-disabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove --invalid-firewall-enabled-service/i,
        }),
      ),
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
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove --invalid-enabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove --invalid-disabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /remove --invalid-masked-service/i,
        }),
      ),
    );

    // Firstboot
    expect(
      await screen.findByRole('heading', { name: /First boot configuration/i }),
    ).toBeInTheDocument();
  }, 20000);
});

describe('Partitioning import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('blueprint import with filesystem works', async () => {
    await setUp();
    await uploadFile(
      `blueprints.json`,
      BLUEPRINT_WITH_FILESYSTEM_CUSTOMIZATION,
    );
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await goToStep('File system configuration');
    await screen.findByRole('button', {
      name: /Basic filesystem partitioning/i,
    });
    await screen.findByDisplayValue('/var');
  });

  test('blueprint import with disk works', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_WITH_DISK_CUSTOMIZATION);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    await waitFor(() => user.click(reviewButton));

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await goToStep('File system configuration');
    await screen.findByRole('button', {
      name: /Advanced disk partitioning/i,
    });
    const minSizeInput = await screen.findByRole('textbox', {
      name: /minimum disk size input/i,
    });

    expect(minSizeInput).toHaveValue('2');

    const unitButtons = await screen.findAllByRole('button', { name: 'GiB' });
    expect(unitButtons[0]).toBeInTheDocument();

    const vgNameInput = await screen.findByRole('textbox', {
      name: /volume group name input/i,
    });
    expect(vgNameInput).toHaveValue('mainvg');
  });

  test('blueprint import with filesystem and disk fails', async () => {
    await setUp();
    await uploadFile(
      `blueprints.json`,
      INVALID_BLUEPRINT_WITH_FILESYSTEM_AND_DISK,
    );
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeDisabled());
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i,
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });
});
