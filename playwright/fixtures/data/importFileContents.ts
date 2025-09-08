export const IMPORT_WITH_DUPLICATE_VALUES = `{
  "customizations": {
    "filesystem": [
      {
        "min_size": 10737418240,
        "mountpoint": "/"
      },
      {
        "min_size": 10737418240,
        "mountpoint": "/"
      },
      {
        "min_size": 1073741824,
        "mountpoint": "/home"
      },
      {
        "min_size": 1073741824,
        "mountpoint": "/srv"
      },
      {
        "min_size": 3221225472,
        "mountpoint": "/var"
      },
      {
        "min_size": 1073741824,
        "mountpoint": "/var/log"
      },
      {
        "min_size": 10737418240,
        "mountpoint": "/var/log/audit"
      },
      {
        "min_size": 1073741824,
        "mountpoint": "/var/tmp"
      }
    ],
    "firewall": {
      "ports": [
        "2020:port", "2020:port", "80:tcp"
      ],
      "services": {
        "disabled": [
          "service2", "service2"
        ],
        "enabled": [
          "service1", "service1"
        ]
      }
    },
    "hostname": "my-hostname",
    "locale": {
      "keyboard": "al",
      "languages": [
        "af_ZA.UTF-8", "af_ZA.UTF-8", "random"
      ]
    },
    "services": {
      "disabled": [
        "sssd", "sssd"
      ],
      "enabled": [
        "auditd", "auditd"
      ],
      "masked": [
        "masked", "masked"
      ]
    },
    "timezone": {
      "ntpservers": [
        "ntp/1313",
        "ntp/1313"
      ],
      "timezone": "Africa/Bissau"
    }
  },
  "description": "",
  "distribution": "rhel-9",
  "name": "duplicate-values"
}`;
