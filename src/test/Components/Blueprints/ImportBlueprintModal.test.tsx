import { screen, waitFor } from '@testing-library/react';
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
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';
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
    user.upload(fileInput, file);
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
    expect(reviewButton).toBeDisabled();
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
    expect(reviewButton).toBeDisabled();
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
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' }),
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
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' }),
      ).toBeInTheDocument(),
    );
  });

  const getSourceDropdown = async () => {
    const sourceDropdown = await screen.findByPlaceholderText(/select source/i);
    await waitFor(() => expect(sourceDropdown).toBeEnabled());

    return sourceDropdown;
  };

  test('should enable button on toml blueprint and go to wizard', async () => {
    await setUp();
    await uploadFile(`blueprints.toml`, ONPREM_BLUEPRINT_TOML);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' }),
      ).toBeInTheDocument(),
    );

    // Image output
    await waitFor(
      async () =>
        await user.click(
          await screen.findByRole('button', { name: /Amazon Web Services/i }),
        ),
    );
    await clickNext();

    // Target environment aws
    const radioButton = await screen.findByRole('radio', {
      name: /use an account configured from sources\./i,
    });
    await waitFor(() => user.click(radioButton));
    const awsSourceDropdown = await getSourceDropdown();
    await waitFor(() => expect(awsSourceDropdown).toBeEnabled());
    await waitFor(() => user.click(awsSourceDropdown));
    const awsSource = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await waitFor(() => user.click(awsSource));

    await clickNext();

    // Registration
    await screen.findByText(
      'Automatically register and enable advanced capabilities.',
    );
    //const registrationCheckbox = await screen.findByRole('radio', {
    //  name: /Automatically register and enable advanced capabilities/i,
    //});
    //expect(registrationCheckbox).toHaveFocus();
    await screen.findByPlaceholderText('Select activation key');

    // OpenScap
    await clickNext();

    // File system configuration
    await clickNext();
    const partition = await screen.findByText('/var');
    expect(partition).toBeInTheDocument();
    const sizeValue = screen.getByRole('cell', {
      name: /2/i,
    });
    expect(sizeValue).toBeInTheDocument();

    // Repository snapshot/Repeatable builds
    await clickNext();

    // Custom Repos step
    await clickNext();

    // Packages step
    await clickNext();
    const selectedToggle = await screen.findByRole('button', {
      name: /selected/i,
    });
    await waitFor(() => user.click(selectedToggle));
    await screen.findByText('tmux');
    await screen.findByText('openssh-server');

    // Users
    await clickNext();
    await screen.findByRole('heading', { name: /Users/ });
    const userName = screen.getByRole('textbox', {
      name: /blueprint user name/i,
    });
    expect(userName).toHaveValue('admin');
    const sshKey = await screen.findByRole('textbox', {
      name: /public SSH key/i,
    });
    expect(sshKey).toHaveValue('ssh-rsa d');
    const adminCheckBox = screen.getByRole('checkbox', {
      name: /administrator/i,
    });
    expect(adminCheckBox).toBeChecked();

    // Timezone
    await clickNext();
    await screen.findByRole('heading', { name: /Timezone/ });
    const timezoneDropDown =
      await screen.findByPlaceholderText(/Select a timezone/i);
    expect(timezoneDropDown).toHaveValue('US/Eastern');
    await screen.findByText(/0\.north-america\.pool\.ntp\.org/i);
    await screen.findByText(/1\.north-america\.pool\.ntp\.org/i);

    // Locale
    await clickNext();
    await screen.findByRole('heading', { name: /Locale/ });
    await screen.findByText('English - United States (en_US.UTF-8)');
    await screen.findByText('Japanese - Japan (ja_JP.UTF-8)');
    const keyboardDropDown =
      await screen.findByPlaceholderText(/Select a keyboard/i);
    expect(keyboardDropDown).toHaveValue('us');

    // Hostname
    await clickNext();
    const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
    expect(hostnameInput).toHaveValue('base-image');

    // Kernel
    await clickNext();
    const kernelNameInput = await screen.findByPlaceholderText(
      /Select kernel package/i,
    );
    expect(kernelNameInput).toHaveValue('kernel-debug');
    await screen.findByText('nosmt=force');

    // Firewall
    await clickNext();
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
    await clickNext();
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
    user.click(reviewButton);

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await clickNext(); // Registration
    await clickNext(); // OpenScap

    // File system configuration
    await clickNext();
    expect(
      await screen.findByText(/The Wizard only supports KiB, MiB, or GiB/),
    ).toBeInTheDocument();

    await clickNext(); // Repository snapshot
    await clickNext(); // Custom Repos step
    await clickNext(); // Packages step

    // Users
    await clickNext();
    expect(await screen.findByText('Invalid user name')).toBeInTheDocument();
    await waitFor(async () =>
      user.type(await screen.findByPlaceholderText('Enter username'), 'est'),
    );
    expect(
      await screen.findByText('Password must be at least 6 characters long'),
    ).toBeInTheDocument();
    await waitFor(async () =>
      user.clear(await screen.findByPlaceholderText('Enter password')),
    );
    expect(await screen.findByText('Invalid SSH key')).toBeInTheDocument();
    await waitFor(async () =>
      user.clear(
        await screen.findByPlaceholderText('Paste your public SSH key'),
      ),
    );

    expect(
      await screen.findByText(/Invalid user groups: 0000/),
    ).toBeInTheDocument();

    await waitFor(() =>
      user.click(screen.getByRole('button', { name: /close 0000/i })),
    );

    // Timezone
    await clickNext();
    expect(await screen.findByText('Unknown timezone')).toBeInTheDocument();
    expect(
      await screen.findByText('Invalid NTP servers: invalid-ntp-server'),
    ).toBeInTheDocument();
    const clearButtons = await screen.findAllByRole('button', {
      name: /clear input/i,
    });
    await waitFor(async () => user.click(clearButtons[0]));
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /close invalid-ntp-server/i,
        }),
      ),
    );

    // Locale
    await clickNext();
    expect(
      await screen.findByText('Unknown languages: invalid-language'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Unknown keyboard')).toBeInTheDocument();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /close invalid-language/i,
        }),
      ),
    );
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /clear input/i,
        }),
      ),
    );

    // Hostname
    await clickNext();
    expect(await screen.findByText(/Invalid hostname/)).toBeInTheDocument();
    await waitFor(() =>
      user.clear(
        screen.getByRole('textbox', {
          name: /hostname input/i,
        }),
      ),
    );

    // Kernel
    await clickNext();
    expect(await screen.findByText(/Invalid format/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Invalid kernel arguments/),
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(screen.getAllByRole('button', { name: /clear input/i })[0]),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close invalid\$kernel\$argument/i,
        }),
      ),
    );

    // Firewall
    await clickNext();
    expect(
      await screen.findByText(/Invalid ports: invalid-port/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid disabled services: --invalid-disabled-service/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid enabled services: --invalid-enabled-service/,
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(screen.getByRole('button', { name: /close invalid-port/i })),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close --invalid-disabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close --invalid-enabled-service/i,
        }),
      ),
    );

    // Services
    await clickNext();
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
          name: /close --invalid-enabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close --invalid-disabled-service/i,
        }),
      ),
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', { name: /close --invalid-masked-service/i }),
      ),
    );

    // AAP
    await clickNext();

    // Firstboot
    await clickNext();
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
    user.click(reviewButton);

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await goToStep('File system configuration');
    expect(
      await screen.findByRole('radio', {
        name: /manually configure partitions/i,
      }),
    ).toBeChecked();
    await screen.findByText('/var');
    expect(
      screen.queryByRole('radio', { name: /advanced disk partitioning/i }),
    ).not.toBeInTheDocument();
  });

  test('blueprint import with disk works', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_WITH_DISK_CUSTOMIZATION);
    const reviewButton = screen.getByRole('button', {
      name: /Review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());
    user.click(reviewButton);

    // Image output
    const guestImageCheckBox = await screen.findByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    await waitFor(() => user.click(guestImageCheckBox));

    await goToStep('File system configuration');
    expect(
      await screen.findByRole('radio', { name: /advanced disk partitioning/i }),
    ).toBeChecked();
    await screen.findByText(
      /minsize: 2 gib type: gpt diskpartitions: \[ \{ "fs_type": "ext4", "label":/i,
    );
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
    expect(reviewButton).toBeDisabled();
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i,
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });
});
