import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderCustomRoutesWithReduxRouter } from '../../test/testUtils';

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
distro = "fedora-38"

[[packages]]
name = "tmux"
version = "*"

[[packages]]
name = "openssh-server"
version = "*"

[[groups]]
name = "anaconda-tools"

[[containers]]
source = "quay.io/fedora/fedora:latest"

[[containers]]
source = "localhost/test:latest"
local-storage = true

[customizations]
hostname = "baseimage"

[customizations.kernel]
name = "kernel-debug"
append = "nosmt=force"

[customizations.rhsm.config.dnf_plugins.product_id]
enabled = true

[customizations.rpm.import_keys]
files = [
  "/etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-18-primary",
  "/etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-19-primary"
]

[[customizations.sshkey]]
user = "root"
key = "PUBLIC SSH KEY"

[[customizations.user]]
name = "admin"
description = "Administrator account"
password = "$6$CHO2$3rN8eviE2t50lmVyBYihTgVRHcaecmeCk31L..."
key = "PUBLIC SSH KEY"
home = "/srv/widget/"
shell = "/usr/bin/bash"
groups = ["widget", "users", "wheel"]
uid = 1200
gid = 1200
expiredate = 12345

[[customizations.group]]
name = "widget"
gid = 1130

[customizations.timezone]
timezone = "US/Eastern"
ntpservers = ["0.north-america.pool.ntp.org", "1.north-america.pool.ntp.org"]

[customizations.locale]
languages = ["en_US.UTF-8"]
keyboard = "us"

[customizations.firewall]
ports = ["22:tcp", "80:tcp", "imap:tcp", "53:tcp", "53:udp", "30000-32767:tcp", "30000-32767:udp"]

[customizations.firewall.services]
enabled = ["ftp", "ntp", "dhcp"]
disabled = ["telnet"]

[customizations.services]
enabled = ["sshd", "cockpit.socket", "httpd"]
disabled = ["postfix", "telnetd"]
masked = ["rpcbind"]

[[customizations.directories]]
path = "/etc/foobar"
mode = "0755"
user = "root"
group = "root"
ensure_parents = false

[[customizations.files]]
path = "/etc/foobar"
mode = "0644"
user = "root"
group = "root"
data = "Hello world!"

[customizations]
installation_device = "/dev/sda"

[customizations.ignition.embedded]
config = "eyJpZ25pdGlvbiI6eyJ2ZXJzaW9uIjoiMy4zLjAifSwicGFzc3dkIjp7InVzZXJzIjpbeyJncm91cHMiOlsid2hlZWwiXSwibmFtZSI6ImNvcmUiLCJwYXNzd29yZEhhc2giOiIkNiRqZnVObk85dDFCdjdOLjdrJEhxUnhxMmJsdFIzek15QUhqc1N6YmU3dUJIWEVyTzFZdnFwaTZsamNJMDZkUUJrZldYWFpDdUUubUpja2xQVHdhQTlyL3hwSmlFZFdEcXR4bGU3aDgxIn1dfX0="

[customizations.ignition.firstboot]
url = "http://some-server/configuration.ig"

[customizations.fdo]
manufacturing_server_url = "http://192.168.122.199:8080"
diun_pub_key_insecure = "true"
di_mfg_string_type_mac_iface = "enp2s0"

[[customizations.repositories]]
id = "example"
name="Example repo"
baseurls=[ "https://example.com/yum/download" ]
gpgcheck=true
gpgkeys = [ "https://example.com/public-key.asc" ]
enabled=true

[customizations]
partitioning_mode = "lvm"

[[customizations.filesystem]]
mountpoint = "/var"
minsize = 2147483648

[customizations.openscap]
datastream = "/usr/share/xml/scap/ssg/content/ssg-rhel8-ds.xml"
profile_id = "xccdf_org.ssgproject.content_profile_cis"

[customizations.openscap.tailoring]
selected = [ "xccdf_org.ssgproject.content_bind_crypto_policy" ]
unselected = [ "grub2_password" ]

[customizations]
fips = true

[customizations.installer]
unattended = true
sudo-nopasswd = ["user", "%wheel"]

[customizations.installer.kickstart]
contents = """
text --non-interactive
zerombr
clearpart --all --initlabel --disklabel=gpt
autopart --noswap --type=lvm
network --bootproto=dhcp --device=link --activate --onboot=on
"""
`

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
});
