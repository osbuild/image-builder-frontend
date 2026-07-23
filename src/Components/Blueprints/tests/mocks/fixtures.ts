import {
  FIRSTBOOT_PATH,
  FIRSTBOOT_SERVICE_PATH,
  RHEL_8,
  RHEL_9,
} from '@/constants';
import type {
  Distributions,
  GetBlueprintApiResponse,
  GetBlueprintComposesApiResponse,
  GetBlueprintsApiResponse,
} from '@/store/api/backend';
import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';

export const existingRepo: ApiRepositoryResponseRead = {
  uuid: 'existing-uuid-1',
  name: 'existing-repo',
  url: 'http://existing.repo.example.com/x86_64/',
  distribution_versions: ['9'],
  distribution_arch: 'x86_64',
  status: 'Valid',
  gpg_key: '',
  metadata_verification: false,
  module_hotfixes: false,
};

export const anotherExistingRepo: ApiRepositoryResponseRead = {
  uuid: 'existing-uuid-2',
  name: 'another-existing-repo',
  url: 'http://another-existing.repo.example.com/x86_64/',
  distribution_versions: ['9'],
  distribution_arch: 'x86_64',
  status: 'Valid',
  gpg_key: '',
  metadata_verification: false,
  module_hotfixes: false,
};

export const newRepoUrl = 'http://brand-new.repo.example.com/x86_64/';

export const importedNewRepo = {
  uuid: 'new-uuid-1',
  url: newRepoUrl,
  name: 'brand-new-repo',
  warnings: [],
};

export const createBlueprintJson = (
  contentSources: { url: string; name?: string }[],
) =>
  JSON.stringify({
    name: 'test-blueprint',
    description: 'Test blueprint',
    distribution: 'rhel-9',
    customizations: {
      packages: [],
    },
    image_requests: [
      {
        architecture: 'x86_64',
        image_type: 'guest-image',
        upload_request: { type: 'aws.s3', options: {} },
      },
    ],
    content_sources: contentSources.map((cs) => ({
      url: cs.url,
      name: cs.name ?? cs.url,
    })),
  });

export const BLUEPRINT_JSON = `{
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

export const IGNORE_SUBSCRIPTION_BLUEPRINT = `{
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

export const INVALID_ARCHITECTURE_JSON = `{
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

export const INVALID_JSON = `{
  "name": "Blueprint test",
}`;

export const MALFORMED_TOML = `[[blueprints
invalid_toml = true`;

export const ONPREM_BLUEPRINT_TOML = `
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

[customizations.services]
enabled = ["sshd", "cockpit.socket", "httpd"]
disabled = ["postfix", "telnetd"]
masked = ["rpcbind"]

[[customizations.files]]
data = "W1VuaXRdCkRlc2NyaXB0aW9uPVJ1biBmaXJzdCBib290IHNjcmlwdApDb25kaXRpb25QYXRoRXhpc3RzPS91c3IvbG9jYWwvc2Jpbi9jdXN0b20tZmlyc3QtYm9vdApXYW50cz1uZXR3b3JrLW9ubGluZS50YXJnZXQKQWZ0ZXI9bmV0d29yay1vbmxpbmUudGFyZ2V0CkFmdGVyPW9zYnVpbGQtZmlyc3QtYm9vdC5zZXJ2aWNlCgpbU2VydmljZV0KVHlwZT1vbmVzaG90CkV4ZWNTdGFydD0vdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QKRXhlY1N0YXJ0UG9zdD1tdiAvdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QgL3Vzci9sb2NhbC9zYmluL2N1c3RvbS1maXJzdC1ib290LmRvbmUKCltJbnN0YWxsXQpXYW50ZWRCeT1tdWx0aS11c2VyLnRhcmdldAo="
data_encoding = "base64"
ensure_parents = true
path = "${FIRSTBOOT_SERVICE_PATH}"

[[customizations.files]]
data = "IyEvYmluL2Jhc2gKZmlyc3Rib290IHNjcmlwdCB0byB0ZXN0IGltcG9ydA=="
data_encoding = "base64"
ensure_parents = true
mode = "0774"
path = "${FIRSTBOOT_PATH}"

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

export const ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES = `
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

[customizations.services]
enabled = ["--invalid-enabled-service"]
disabled = ["--invalid-disabled-service"]
masked = ["--invalid-masked-service"]

[[customizations.files]]
data = "W1VuaXRdCkRlc2NyaXB0aW9uPVJ1biBmaXJzdCBib290IHNjcmlwdApDb25kaXRpb25QYXRoRXhpc3RzPS91c3IvbG9jYWwvc2Jpbi9jdXN0b20tZmlyc3QtYm9vdApXYW50cz1uZXR3b3JrLW9ubGluZS50YXJnZXQKQWZ0ZXI9bmV0d29yay1vbmxpbmUudGFyZ2V0CkFmdGVyPW9zYnVpbGQtZmlyc3QtYm9vdC5zZXJ2aWNlCgpbU2VydmljZV0KVHlwZT1vbmVzaG90CkV4ZWNTdGFydD0vdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QKRXhlY1N0YXJ0UG9zdD1tdiAvdXNyL2xvY2FsL3NiaW4vY3VzdG9tLWZpcnN0LWJvb3QgL3Vzci9sb2NhbC9zYmluL2N1c3RvbS1maXJzdC1ib290LmRvbmUKCltJbnN0YWxsXQpXYW50ZWRCeT1tdWx0aS11c2VyLnRhcmdldAo="
data_encoding = "base64"
ensure_parents = true
path = "${FIRSTBOOT_SERVICE_PATH}"

[[customizations.files]]
data = "IyEvYmluL2Jhc2gKZmlyc3Rib290IHNjcmlwdCB0byB0ZXN0IGltcG9ydA=="
data_encoding = "base64"
ensure_parents = true
mode = "0774"
path = "${FIRSTBOOT_PATH}"

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
append = "invalid$kernel$argument"

[customizations.firewall]
ports = ["invalid-port"]

[customizations.firewall.services]
enabled = ["--invalid-firewall-enabled-service"]
disabled = ["--invalid-firewall-disabled-service"]
`;

export const BLUEPRINT_WITH_FILESYSTEM_CUSTOMIZATION = `{
  "customizations": {
    "filesystem": [
      {
        "min_size": 2147483648,
        "mountpoint": "/var"
      }
    ]
  },
  "description": "",
  "distribution": "rhel-9",
  "metadata": {
    "exported_at": "2025-08-28 07:23:55.65012838 +0000 UTC",
    "parent_id": "0ebb366f-d567-4580-83e4-45cf9e874aa8"
  },
  "name": "blueprint-with-filesystem"
}`;

export const BLUEPRINT_WITH_DISK_CUSTOMIZATION = `{
  "customizations": {
    "disk": {
      "minsize": "2 GiB",
      "partitions": [
        {
          "fs_type": "ext4",
          "minsize": "2 GiB",
          "mountpoint": "/",
          "type": "plain"
        },
        {
          "minsize": "2 GiB",
          "subvolumes": [
            {
              "mountpoint": "/home",
              "name": "homesv"
            }
          ],
          "type": "btrfs"
        },
        {
          "logical_volumes": [
            {
              "fs_type": "ext4",
              "minsize": "2 GiB",
              "mountpoint": "/home",
              "name": "homelv"
            }
          ],
          "minsize": "2 GiB",
          "name": "mainvg",
          "type": "lvm"
        }
      ],
      "type": "gpt"
    }
  },
  "description": "",
  "distribution": "rhel-9",
  "metadata": {
    "exported_at": "2025-08-28 07:23:55.65012838 +0000 UTC",
    "parent_id": "0ebb366f-d567-4580-83e4-45cf9e874aa8"
  },
  "name": "blueprint-with-disk"
}`;

export const INVALID_BLUEPRINT_WITH_FILESYSTEM_AND_DISK = `{
  "customizations": {
    "filesystem": [
      {
        "min_size": 2147483648,
        "mountpoint": "/var"
      }
    ],
    "disk": {
      "minsize": "2 GiB",
      "partitions": [
        {
          "fs_type": "ext4",
          "minsize": "2 GiB",
          "mountpoint": "string",
          "type": "plain"
        },
        {
          "minsize": "2 GiB",
          "subvolumes": [
            {
              "mountpoint": "string",
              "name": "string"
            }
          ],
          "type": "btrfs"
        },
        {
          "logical_volumes": [
            {
              "fs_type": "ext4",
              "minsize": "2 GiB",
              "mountpoint": "string",
              "name": "string"
            }
          ],
          "minsize": "2 GiB",
          "name": "string",
          "type": "lvm"
        }
      ],
    }
  },
  "description": "",
  "distribution": "rhel-9",
  "metadata": {
    "exported_at": "2025-08-28 07:23:55.65012838 +0000 UTC",
    "parent_id": "0ebb366f-d567-4580-83e4-45cf9e874aa8"
  },
  "name": "blueprint-with-disk"
}`;

export const BLUEPRINT_ID_DARK_CHOCOLATE =
  '677b010b-e95e-4694-9813-d11d847f1bfc';
export const BLUEPRINT_ID_MILK_CHOCOLATE =
  '193482e4-4bd0-4898-a8bc-dc8c33ed669f';
export const BLUEPRINT_ID_MULTIPLE_TARGETS =
  'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa';
export const BLUEPRINT_ID_OUT_OF_SYNC = '51243667-8d87-4aef-8dd1-84fc58261b05';
export const BLUEPRINT_ID_CENTOS8 = 'b1f10309-a250-4db8-ab64-c110176e3eb7';
export const BLUEPRINT_ID_COMPLIANCE = '21571945-fe23-45e9-8afb-4aa073b8d735';

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 28 },
  data: [
    {
      id: '677b010b-e95e-4694-9813-d11d847f1bfc',
      name: 'Dark Chocolate',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 2,
      last_modified_at: '2021-09-09T14:38:00.000Z',
    },
    {
      id: '193482e4-4bd0-4898-a8bc-dc8c33ed669f',
      name: 'Milk Chocolate',
      description: '40% Milk Chocolate with salted caramel',
      version: 1,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      name: 'Multiple Target',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 2,
      last_modified_at: '2021-09-09T14:38:00.000Z',
    },
    {
      id: '51243667-8d87-4aef-8dd1-84fc58261b05',
      name: 'Lemon Pie',
      description: 'Crusted lemon pie with meringue topping',
      version: 2,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: 'b1f10309-a250-4db8-ab64-c110176e3eb7',
      name: 'Cupcake',
      description: 'Small cake with frosting',
      version: 1,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: '8642171b-d4e5-408b-af9f-68ce8a640df8',
      name: 'Salted Caramel Cheesecake',
      description: 'Cheesecake topped with salted caramel',
      version: 1,
      last_modified_at: '2021-09-08T15:12:00.000Z',
    },
    {
      id: 'f460c4eb-0b73-4a56-a1a6-5defc7e29d6b',
      name: 'Crustless New York Cheesecake',
      description: 'Creamy delicius cheesecake',
      version: 1,
      last_modified_at: '2021-09-08T16:24:00.000Z',
    },
    {
      id: '366c2c1f-26cd-430a-97a2-f671d7e834b4',
      name: 'Fresh Plum Kuchen',
      description: 'Kuchen made from the best plums',
      version: 1,
      last_modified_at: '2021-09-08T17:03:00.000Z',
    },
    {
      id: '3f1a2e77-43b2-467d-b71b-c031ae8f3b7f',
      name: 'Chocolate Angel Cake',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 1,
      last_modified_at: '2021-09-08T18:10:00.000Z',
    },
    {
      id: '689158a7-aa02-4581-b695-6608383477cb',
      name: 'Cherry Cola Cake',
      description: 'Made from fresh cherries',
      version: 1,
      last_modified_at: '2021-09-08T19:45:00.000Z',
    },
    {
      id: '6f073028-128d-4e6e-af98-0da2e58c8b60',
      name: 'Hummingbird Cake',
      description: 'Banana-pineapple spice cake',
      version: 1,
      last_modified_at: '2021-09-08T20:18:00.000Z',
    },
    {
      id: '147032db-8697-4638-8fdd-6f428100d8fc',
      name: 'Pink Velvet',
      description: 'Layered cake with icing',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'b40509a4-741e-44c8-a2a9-25ef2bbf378c',
      name: 'rhel9',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'c6b0bbcf-f006-4059-a20c-4bcafa452b76',
      name: 'rhel8',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '2206aa19-f1ae-4691-a386-e9c3f6c2cf99',
      name: 'centos9',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '00ec80dc-a64a-4756-879a-461e98591e6d',
      name: 'x86_64',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '035810f9-22b6-4118-bdc1-c46183437d40',
      name: 'aarch64',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'ae17f987-0808-4398-a0bb-93605f02768e',
      name: 'aws',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '34449e42-1b61-4fd7-9bf2-55210b5f21cd',
      name: 'gcp',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '21698d07-10af-425f-bae3-51e6961318b5',
      name: 'azure',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '00d2bf0f-55fc-40ae-ad3e-14368c69497a',
      name: 'registration',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '260823fd-0a51-43fd-bc1c-77255848de04',
      name: 'oscap',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'ec486dea-78f8-43ee-9c69-8f76b9d1b143',
      name: 'fsc',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '2d3818f8-479f-4d90-a61f-e32d833cc448',
      name: 'disk',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '5dafa0fc-a5c8-4dc3-8a03-ceeb3677b28a',
      name: 'snapshot',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '6f20ab62-37ba-4afd-9945-734919e9307b',
      name: 'repositories',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'b3437c4e-f6f8-4270-8d32-323ac60bc929',
      name: 'packages',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '87610289-96e5-4fb6-a359-0e56269ff6de',
      name: 'users',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'c535dc6e-93b0-4592-ad29-fe46ba7dac73',
      name: 'timezone',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '6e982b49-cd2e-4ad0-9962-39315a0ed9d1',
      name: 'locale',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '05677f58-56c5-4c1e-953b-c8a93da70cc5',
      name: 'hostname',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '8d6d35c7-a098-4bf5-a67f-5c59628210dc',
      name: 'kernel',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '26f14b17-bdee-4c06-a12b-b6ee384350de',
      name: 'firewall',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '718dfa72-c919-4ad8-a02f-a8cd5bbd6edc',
      name: 'services',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'd0a8376e-e44e-47b3-845d-30f5199a35b6',
      name: 'firstBoot',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '58991b91-4b98-47e0-b26d-8d908678ddb3',
      name: 'details',
      description: 'This is a test description for the Details step.',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: '21571945-fe23-45e9-8afb-4aa073b8d735',
      name: 'compliance',
      description: '',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: 'b3ff8307-18bd-418a-9a91-836ce039b035',
      name: 'cockpithack',
      description: 'hacky blueprint for cockpit composes, see fsinfo mock',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
  ],
};

export const emptyGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 0 },
  data: [],
};

export const mockBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 4 },
  data: [
    {
      id: '63e42aaf-b543-41c6-899f-3de1e61838dc',
      image_name: 'dark-chocolate-aws',
      created_at: '2023-09-08T14:38:00.000Z',
      blueprint_id: BLUEPRINT_ID_DARK_CHOCOLATE,
      blueprint_version: 2,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_name: 'dark-chocolate-aws',
      created_at: '2021-09-08T14:38:00.000Z',
      blueprint_version: 1,
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    {
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      image_name: 'Dark Chocolate',
      created_at: '2021-04-27T12:31:12Z',
      blueprint_id: BLUEPRINT_ID_DARK_CHOCOLATE,
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'gcp',
            upload_request: {
              type: 'gcp',
              options: {
                share_with_accounts: ['serviceAccount:test@email.com'],
              },
            },
          },
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    {
      id: 'a8f5e2d1-9c3b-4f6a-b7e8-1d2c3f4a5b6c',
      image_name: 'dark-chocolate-bootc',
      created_at: '2024-03-01T10:00:00Z',
      blueprint_id: BLUEPRINT_ID_DARK_CHOCOLATE,
      blueprint_version: 2,
      request: {
        bootc: {
          reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
        },
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: {
              type: 'aws.s3',
              options: {},
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const mockEmptyBlueprintsComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 0 },
  data: [],
  links: { first: 'first', last: 'last' },
};

export const mockBlueprintComposesOutOfSync: GetBlueprintComposesApiResponse = {
  meta: { count: 1 },
  data: [
    {
      id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
      image_name: 'Lemon Pie',
      created_at: '2021-09-08T14:38:00.000Z',
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const mockCentosBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 1 },
  data: [
    {
      id: '4873fd0f-1851-4b9f-b4fe-4639fce90794',
      image_name: 'Cupcake',
      created_at: '2021-04-27T12:31:12Z',
      blueprint_version: 1,
      request: {
        distribution: 'centos-8' as Distributions,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'image-installer',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const darkChocolateBlueprintResponse: GetBlueprintApiResponse = {
  ...mockGetBlueprints.data[0],
  image_requests: mockBlueprintComposes.data[0].request.image_requests,
  distribution: mockBlueprintComposes.data[0].request.distribution,
  customizations: {
    subscription: {
      organization: 1234,
      'activation-key': '',
      'server-url': '',
      'base-url': '',
      insights: true,
      rhc: true,
    },
  },
  lint: {
    errors: [],
    warnings: [],
  },
};

export const multipleTargetsBlueprintResponse: GetBlueprintApiResponse = {
  ...mockGetBlueprints.data[2],
  image_requests: mockBlueprintComposes.data[2].request.image_requests,
  distribution: mockBlueprintComposes.data[2].request.distribution,
  customizations: {
    subscription: {
      organization: 1234,
      'activation-key': '',
      'server-url': '',
      'base-url': '',
      insights: true,
      rhc: true,
    },
  },
  lint: {
    errors: [],
    warnings: [],
  },
};

export const complianceBlueprintResponse: GetBlueprintApiResponse = {
  ...mockGetBlueprints.data.find((b) => b.id === BLUEPRINT_ID_COMPLIANCE)!,
  distribution: RHEL_9,
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: {
        type: 'aws.s3',
        options: {},
      },
    },
  ],
  customizations: {},
  lint: {
    errors: [
      {
        name: 'compliance',
        description: "some thingy isn't right",
      },
    ],
    warnings: [],
  },
};

export const blueprintsEndpoint = (url: URL) => {
  const nameParam = url.searchParams.get('name');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const resp = { ...mockGetBlueprints };

  if (nameParam) {
    resp.data = resp.data.filter(({ name }) => nameParam === name);
  } else if (search) {
    let regexp: RegExp;
    try {
      regexp = new RegExp(search);
    } catch {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regexp = new RegExp(sanitized);
    }
    resp.data = resp.data.filter(({ name }) => regexp.test(name));
  }

  resp.meta = { count: resp.data.length };
  resp.data = resp.data.slice(offset, offset + limit);

  return resp;
};

export const getBlueprintResponse = (
  id: string,
  fixedBlueprintIds?: Set<string>,
) => {
  switch (id) {
    case BLUEPRINT_ID_DARK_CHOCOLATE:
      return darkChocolateBlueprintResponse;
    case BLUEPRINT_ID_MULTIPLE_TARGETS:
      return multipleTargetsBlueprintResponse;
    case BLUEPRINT_ID_COMPLIANCE: {
      const resp = { ...complianceBlueprintResponse };
      if (fixedBlueprintIds?.has(id)) {
        resp.lint = { errors: [], warnings: [] };
      }
      return resp;
    }
    default:
      return {
        id,
        name: mockGetBlueprints.data.find((b) => b.id === id)?.name ?? id,
        version: mockGetBlueprints.data.find((b) => b.id === id)?.version ?? 1,
        description: '',
        distribution: RHEL_9 as Distributions,
        image_requests: [
          {
            architecture: 'x86_64' as const,
            image_type: 'guest-image' as const,
            upload_request: {
              type: 'aws.s3' as const,
              options: {},
            },
          },
        ],
        customizations: {},
        lint: { errors: [], warnings: [] },
      };
  }
};

export const getBlueprintComposesResponse = (id: string) => {
  switch (id) {
    case BLUEPRINT_ID_MILK_CHOCOLATE:
      return mockEmptyBlueprintsComposes;
    case BLUEPRINT_ID_OUT_OF_SYNC:
      return mockBlueprintComposesOutOfSync;
    case BLUEPRINT_ID_CENTOS8:
      return mockCentosBlueprintComposes;
    default:
      return mockBlueprintComposes;
  }
};
