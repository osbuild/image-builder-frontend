import {
  GetOscapProfilesApiResponse,
  GetOscapCustomizationsApiResponse,
} from '../../store/imageBuilderApi';

export const distributionOscapProfiles = (): GetOscapProfilesApiResponse => {
  return [
    'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
    'xccdf_org.ssgproject.content_profile_cis_workstation_l2',
    'xccdf_org.ssgproject.content_profile_stig_gui',
  ];
};

export const oscapCustomizations = (
  profile: string
): GetOscapCustomizationsApiResponse => {
  if (profile === 'xccdf_org.ssgproject.content_profile_cis_workstation_l1') {
    return {
      filesystem: [{ min_size: 1073741824, mountpoint: '/tmp' }],
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
        profile_name:
          'CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
        profile_description:
          'This is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere velit enim, tincidunt porttitor nisl elementum eu.',
      },
      packages: [
        'aide',
        'sudo',
        'rsyslog',
        'firewalld',
        'nftables',
        'libselinux',
      ],
      kernel: {
        append: 'audit_backlog_limit=8192 audit=1',
      },
      services: {
        masked: ['nfs-server'],
        enabled: ['crond'],
      },
    };
  }
  if (profile === 'xccdf_org.ssgproject.content_profile_cis_workstation_l2') {
    return {
      filesystem: [{ min_size: 1073741824, mountpoint: '/tmp' }],
      openscap: {
        profile_id: 'content_profile_cis_workstation_l2',
        profile_name:
          'CIS Red Hat Enterprise Linux 8 Benchmark for Level 2 - Workstation',
        profile_description:
          'This is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere velit enim, tincidunt porttitor nisl elementum eu.',
      },
      packages: [
        'aide',
        'sudo',
        'rsyslog',
        'firewalld',
        'nftables',
        'libselinux',
      ],
      kernel: {
        append: 'audit_backlog_limit=8192 audit=1',
      },
      services: {
        disabled: ['nfs-server', 'nftables'],
        enabled: ['crond', 'firewalld'],
      },
    };
  }
  return {
    filesystem: [{ min_size: 1073741824, mountpoint: '/tmp' }],
    openscap: {
      profile_id: 'content_profile_stig_gui',
      profile_name: 'DISA STIG with GUI for Red Hat Enterprise Linux 8',
      profile_description:
        'This is a mocked profile description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere velit enim, tincidunt porttitor nisl elementum eu.',
    },
    packages: [
      'aide',
      'sudo',
      'rsyslog',
      'firewalld',
      'nftables',
      'libselinux',
    ],
    kernel: {
      append: 'audit_backlog_limit=8192 audit=1',
    },
    services: {
      disabled: ['nfs-server', 'rpcbind', 'autofs', 'nftables'],
      enabled: ['crond', 'firewalld', 'systemd-journald', 'rsyslog', 'auditd'],
    },
  };
};
