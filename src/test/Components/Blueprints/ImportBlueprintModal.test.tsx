import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderCustomRoutesWithReduxRouter } from '../../testUtils';
import { clickNext } from '../CreateImageWizard/wizardTestUtils';

const BLUEPRINT_JSON = `{
  "customizations": {
    "packages": [],
    "subscription": {
      "activation-key": "",
      "base-url": "",
      "insights": false,
      "organization": 0,
      "server-url": ""
    }
  },
  "description": "Lorem ipsum dolor 2211 sit amet, consectetur adipiscing elit. Pellentesque malesuada ultricies diam ac eleifend. Proin ipsum ante, consequat vel justo vel, tristique vestibulum lorem. Vestibulum sit amet pulvinar orci. Vivamus vel ipsum.",
  "distribution": "rhel-8",
  "metadata": {
    "exported_at": "2024-07-29 17:26:51.666952376 +0000 UTC",
    "parent_id": "b3385e6d-ecc4-485c-b33c-f65131c46f52"
  },
  "name": "Crustless New York Cheesecake 1"
}`;

const IGNORE_SUBSCRIPTION_BLUEPRINT = `{
  "customizations": {
    "files": [
    ],
    "kernel": {
    },
    "openscap": {
    },
    "packages": [
      "aide",
      "sudo",
      "audit",
      "rsyslog",
      "firewalld",
      "nftables",
      "libselinux"
    ],
    "services": {
      "enabled": [
        "crond",
        "firewalld",
        "systemd-journald",
        "rsyslog",
        "auditd"
      ]
    },
    "subscription": {
      "activation-key": "",
      "base-url": "",
      "insights": false,
      "organization": 0,
      "server-url": ""
    }
  },
  "description": "Tested blueprint",
  "distribution": "rhel-93",
  "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
  "name": "Blueprint test"
}`;

const INVALID_ARCHITECTURE_JSON = `{
  "customizations": {
    "files": [
    ],
    "kernel": {
    },
    "openscap": {
    },
    "packages": [
      "aide",
      "sudo",
      "audit",
      "rsyslog",
      "firewalld",
      "nftables",
      "libselinux"
    ],
    "services": {
      "enabled": [
        "crond",
        "firewalld",
        "systemd-journald",
        "rsyslog",
        "auditd"
      ]
    },
    "subscription": {
      "activation-key": "",
      "base-url": "",
      "insights": false,
      "organization": 0,
      "server-url": ""
    }
  },
  "description": "Tested blueprint",
  "distribution": "rhel-93",
  "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
  "image_requests": [
    {
      "architecture": "aaaaa",
      "image_type": "aws",
      "upload_request": {
        "options": {
          "share_with_sources": [
            "473980"
          ]
        },
        "type": "aws"
      }
    }
  ],
  "name": "Blueprint test"
}`;

const INVALID_JSON = `{
  "name": "Blueprint test"
}`;

const ONPREM_BLUEPRINT_TOML = `
name = "tmux"
description = "tmux image with openssh"
version = "1.2.16"
distro = "rhel-93"

[[packages]]
name = "tmux"
version = "*"

[[packages]]
name = "openssh-server"
version = "*"

[[groups]]
name = "anaconda-tools"

[customizations]
hostname = "base-image"
fips = true

[[customizations.sshkey]]
user = "root"
key = "ssh-rsa d"

[[customizations.user]]
name = "admin"
password = "$6$CHO2$3rN8eviE2t50lmVyBYihTgVRHcaecmeCk31L..."
key = "ssh-rsa d"
groups = ["widget", "users", "wheel"]

[customizations.services]
enabled = ["sshd", "cockpit.socket", "httpd"]
disabled = ["postfix", "telnetd"]
masked = ["rpcbind"]

[[customizations.files]]
data = "W1VuaXRdCkRlc2NyaXB0aW9uPVJ1biBmaXJzdCBib290IHNjcmlwdApDb25kaXRpb25QYXRoRXhpc3RzPS91c3IvbG9jYWwvc2Jpbi9jdXN0b20tZmlyc3QtYm9vdApXYW50cz1uZXR3b3JrLW9ubGluZS50YXJnZXQKQWZ0ZXI9bmV0d29yay1vbmxpbmUudGFyZ2V0CkFmdGVyPW9zYnVpbGQtZmlyc3QtYm9vdC5zZXJ2aWNlCgpbU2VydmljZV0KVHlwZT1vbmVzaG90CkV4ZWNTdGFydD0vdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QKRXhlY1N0YXJ0UG9zdD1tdiAvdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QgL3Vzci9sb2NhbC9zYmluL2N1c3RvbS1maXJzdC1ib290LmRvbmUKCltJbnN0YWxsXQpXYW50ZWRCeT1tdWx0aS11c2VyLnRhcmdldAo="
data_encoding = "base64"
ensure_parents = true
path = "/etc/systemd/system/custom-first-boot.service"

[[customizations.files]]
data = "IyEvYmluL2Jhc2gKZmlyc3Rib290IHNjcmlwdCB0byB0ZXN0IGltcG9ydA=="
data_encoding = "base64"
ensure_parents = true
mode = "0774"
path = "/usr/local/sbin/custom-first-boot"

[[customizations.filesystem]]
mountpoint = "/var"
minsize = 2147483648

[customizations.installer]
unattended = true
sudo-nopasswd = ["user", "%wheel"]

[customizations.timezone]
timezone = "US/Eastern"
ntpservers = ["0.north-america.pool.ntp.org", "1.north-america.pool.ntp.org"]

[customizations.locale]
languages = ["en_US.UTF-8", "ja_JP.UTF-8"]
keyboard = "us"

[customizations.kernel]
name = "kernel-debug"
append = "nosmt=force"

[customizations.firewall]
ports = ["22:tcp", "80:tcp", "imap:tcp"]
[customizations.firewall.services]
enabled = ["ftp", "ntp"]
disabled = ["telnet"]
`;

const ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES = `
name = "tmux"
description = "tmux image with openssh"
version = "1.2.16"
distro = "rhel-93"

[[packages]]
name = "tmux"
version = "*"

[[packages]]
name = "openssh-server"
version = "*"

[[groups]]
name = "anaconda-tools"

[customizations]
hostname = "--invalid-hostname--"
fips = true

[[customizations.sshkey]]
user = "root"
key = "ssh-rsa d"

[[customizations.user]]
name = "admin"
password = "$6$CHO2$3rN8eviE2t50lmVyBYihTgVRHcaecmeCk31L..."
key = "ssh-rsa d"
groups = ["widget", "users", "wheel"]

[customizations.services]
enabled = ["--invalid-enabled-service"]
disabled = ["--invalid-disabled-service"]
masked = ["--invalid-masked-service"]

[[customizations.files]]
data = "W1VuaXRdCkRlc2NyaXB0aW9uPVJ1biBmaXJzdCBib290IHNjcmlwdApDb25kaXRpb25QYXRoRXhpc3RzPS91c3IvbG9jYWwvc2Jpbi9jdXN0b20tZmlyc3QtYm9vdApXYW50cz1uZXR3b3JrLW9ubGluZS50YXJnZXQKQWZ0ZXI9bmV0d29yay1vbmxpbmUudGFyZ2V0CkFmdGVyPW9zYnVpbGQtZmlyc3QtYm9vdC5zZXJ2aWNlCgpbU2VydmljZV0KVHlwZT1vbmVzaG90CkV4ZWNTdGFydD0vdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QKRXhlY1N0YXJ0UG9zdD1tdiAvdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QgL3Vzci9sb2NhbC9zYmluL2N1c3RvbS1maXJzdC1ib290LmRvbmUKCltJbnN0YWxsXQpXYW50ZWRCeT1tdWx0aS11c2VyLnRhcmdldAo="
data_encoding = "base64"
ensure_parents = true
path = "/etc/systemd/system/custom-first-boot.service"

[[customizations.files]]
data = "IyEvYmluL2Jhc2gKZmlyc3Rib290IHNjcmlwdCB0byB0ZXN0IGltcG9ydA=="
data_encoding = "base64"
ensure_parents = true
mode = "0774"
path = "/usr/local/sbin/custom-first-boot"

[[customizations.filesystem]]
mountpoint = "/var"
minsize = 1000000

[customizations.installer]
unattended = true
sudo-nopasswd = ["user", "%wheel"]

[customizations.timezone]
timezone = "invalid-timezone"
ntpservers = ["0.north-america.pool.ntp.org", "1.north-america.pool.ntp.org", "invalid-ntp-server"]

[customizations.locale]
languages = ["invalid-language"]
keyboard = "invalid-keyboard"

[customizations.kernel]
name = "--invalid-kernel-name--"
append = "invalid-kernel-argument"

[customizations.firewall]
ports = ["invalid-port"]

[customizations.firewall.services]
enabled = ["--invalid-enabled-service"]
disabled = ["--invalid-disabled-service"]
`;

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
    const importButton = await screen.findByTestId('import-blueprint-button');
    await waitFor(() => expect(importButton).toBeInTheDocument());
  });

  const setUp = async () => {
    renderCustomRoutesWithReduxRouter();
    const importBlueprintBtn = await screen.findByTestId(
      'import-blueprint-button'
    );
    await waitFor(() => user.click(importBlueprintBtn));
    const reviewButton = await screen.findByRole('button', {
      name: /review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toHaveClass('pf-m-disabled'));
  };

  test('should show alert on invalid blueprint', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should show alert on invalid blueprint incorrect architecture', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_ARCHITECTURE_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should enable button and ignore subscription in blueprint file', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, IGNORE_SUBSCRIPTION_BLUEPRINT);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' })
      ).toBeInTheDocument()
    );
  });

  test('should enable button on correct blueprint and go to wizard', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' })
      ).toBeInTheDocument()
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
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' })
      ).toBeInTheDocument()
    );

    // Image output
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
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
      'Automatically register and enable advanced capabilities'
    );
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-radio'
    );
    expect(registrationCheckbox).toHaveFocus();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

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
    const timezoneDropDown = await screen.findByPlaceholderText(
      /Select a timezone/i
    );
    expect(timezoneDropDown).toHaveValue('US/Eastern');
    await screen.findByText(/0\.north-america\.pool\.ntp\.org/i);
    await screen.findByText(/1\.north-america\.pool\.ntp\.org/i);

    // Locale
    await clickNext();
    await screen.findByRole('heading', { name: /Locale/ });
    await screen.findByText('en_US.UTF-8');
    await screen.findByText('ja_JP.UTF-8');
    const keyboardDropDown = await screen.findByPlaceholderText(
      /Select a keyboard/i
    );
    expect(keyboardDropDown).toHaveValue('us');

    // Hostname
    await clickNext();
    const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
    expect(hostnameInput).toHaveValue('base-image');

    // Kernel
    await clickNext();
    const kernelNameInput = await screen.findByPlaceholderText(
      /Select kernel package/i
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
      ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES
    );
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));
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
      await screen.findByText(/The Wizard only supports KiB, MiB, or GiB/)
    ).toBeInTheDocument();

    await clickNext(); // Repository snapshot
    await clickNext(); // Custom Repos step
    await clickNext(); // Packages step
    await clickNext(); // Users

    // Timezone
    await clickNext();
    expect(await screen.findByText('Unknown timezone')).toBeInTheDocument();
    expect(
      await screen.findByText('Invalid NTP servers: invalid-ntp-server')
    ).toBeInTheDocument();
    const clearButtons = await screen.findAllByRole('button', {
      name: /clear input/i,
    });
    await waitFor(async () => user.click(clearButtons[0]));
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /close invalid-ntp-server/i,
        })
      )
    );

    // Locale
    await clickNext();
    expect(
      await screen.findByText('Unknown languages: invalid-language')
    ).toBeInTheDocument();
    expect(await screen.findByText('Unknown keyboard')).toBeInTheDocument();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /close invalid-language/i,
        })
      )
    );
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', {
          name: /clear input/i,
        })
      )
    );

    // Hostname
    await clickNext();
    expect(await screen.findByText(/Invalid hostname/)).toBeInTheDocument();
    await waitFor(() =>
      user.clear(
        screen.getByRole('textbox', {
          name: /hostname input/i,
        })
      )
    );

    // Kernel
    await clickNext();
    expect(await screen.findByText(/Invalid format/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Invalid kernel arguments/)
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(screen.getAllByRole('button', { name: /clear input/i })[0])
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', { name: /close invalid-kernel-argument/i })
      )
    );

    // Firewall
    await clickNext();
    expect(
      await screen.findByText(/Invalid ports: invalid-port/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid disabled services: --invalid-disabled-service/
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid enabled services: --invalid-enabled-service/
      )
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(screen.getByRole('button', { name: /close invalid-port/i }))
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close --invalid-disabled-service/i,
        })
      )
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', { name: /close --invalid-enabled-service/i })
      )
    );

    // Services
    await clickNext();
    expect(
      await screen.findByText(
        /Invalid enabled services: --invalid-enabled-service/
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid disabled services: --invalid-disabled-service/
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Invalid masked services: --invalid-masked-service/
      )
    ).toBeInTheDocument();
    await waitFor(() =>
      user.click(
        screen.getByRole('button', { name: /close --invalid-enabled-service/i })
      )
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /close --invalid-disabled-service/i,
        })
      )
    );
    await waitFor(() =>
      user.click(
        screen.getByRole('button', { name: /close --invalid-masked-service/i })
      )
    );

    // Firstboot
    await clickNext();
    expect(
      await screen.findByRole('heading', { name: /First boot configuration/i })
    ).toBeInTheDocument();
  }, 20000);
});
