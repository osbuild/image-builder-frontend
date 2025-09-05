import { FIRSTBOOT_PATH, FIRSTBOOT_SERVICE_PATH } from '../../constants';

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
  "name": "Blueprint test"
}`;

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

[[customizations.user]]
name = "t"
password = "00"
key = "KEY"
groups = ["0000"]

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
enabled = ["--invalid-enabled-service"]
disabled = ["--invalid-disabled-service"]
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
          "label": "string",
          "minsize": "2 GiB",
          "mountpoint": "string",
          "part_type": "string",
          "type": "plain"
        },
        {
          "minsize": "2 GiB",
          "part_type": "string",
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
              "label": "string",
              "minsize": "2 GiB",
              "mountpoint": "string",
              "name": "string"
            }
          ],
          "minsize": "2 GiB",
          "name": "string",
          "part_type": "string",
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
          "label": "string",
          "minsize": "2 GiB",
          "mountpoint": "string",
          "part_type": "string",
          "type": "plain"
        },
        {
          "minsize": "2 GiB",
          "part_type": "string",
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
              "label": "string",
              "minsize": "2 GiB",
              "mountpoint": "string",
              "name": "string"
            }
          ],
          "minsize": "2 GiB",
          "name": "string",
          "part_type": "string",
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
