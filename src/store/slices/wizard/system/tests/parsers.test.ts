import { describe, expect, it } from 'vitest';

import { FIRSTBOOT_PATH } from '@/constants';
import {
  BlueprintResponse,
  Customizations,
  Distributions,
} from '@/store/api/backend';

import { parseSystemFromRequest } from '../parsers';
import { initialState } from '../state';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const withCustomizations = (customizations: Customizations) =>
  createMinimalBlueprint({ customizations });

describe('parseSystemFromRequest', () => {
  it('returns initial state for empty customizations', () => {
    expect(parseSystemFromRequest(withCustomizations({}))).toEqual({
      ...initialState,
      locale: { languages: [], keyboard: '' },
    });
  });

  describe('services', () => {
    it('returns initial services when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.services).toEqual(initialState.services);
    });

    it('maps enabled, disabled, and masked services', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          services: {
            enabled: ['httpd', 'sshd'],
            disabled: ['telnet'],
            masked: ['ftp'],
          },
        }),
      );
      expect(result.services).toEqual({
        enabled: ['httpd', 'sshd'],
        disabled: ['telnet'],
        masked: ['ftp'],
      });
    });

    it('defaults missing arrays to empty', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ services: {} }),
      );
      expect(result.services).toEqual({
        enabled: [],
        disabled: [],
        masked: [],
      });
    });
  });

  describe('kernel', () => {
    it('returns initial kernel when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.kernel).toEqual(initialState.kernel);
    });

    it('maps kernel name', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ kernel: { name: 'kernel-rt' } }),
      );
      expect(result.kernel.name).toBe('kernel-rt');
    });

    it('splits kernel append string into array', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          kernel: { append: 'nosmt=force audit=1' },
        }),
      );
      expect(result.kernel.append).toEqual(['nosmt=force', 'audit=1']);
    });

    it('defaults missing name to empty string and append to empty array', () => {
      const result = parseSystemFromRequest(withCustomizations({ kernel: {} }));
      expect(result.kernel).toEqual({ name: '', append: [] });
    });
  });

  describe('locale', () => {
    it('returns empty locale when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.locale).toEqual({ languages: [], keyboard: '' });
    });

    it('maps languages and keyboard', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          locale: {
            languages: ['en_US.UTF-8', 'fr_FR.UTF-8'],
            keyboard: 'us',
          },
        }),
      );
      expect(result.locale).toEqual({
        languages: ['en_US.UTF-8', 'fr_FR.UTF-8'],
        keyboard: 'us',
      });
    });
  });

  describe('timezone', () => {
    it('returns initial timezone when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.timezone).toEqual(initialState.timezone);
    });

    it('maps timezone and NTP servers', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          timezone: {
            timezone: 'America/New_York',
            ntpservers: ['0.pool.ntp.org', '1.pool.ntp.org'],
          },
        }),
      );
      expect(result.timezone).toEqual({
        timezone: 'America/New_York',
        ntpservers: ['0.pool.ntp.org', '1.pool.ntp.org'],
      });
    });
  });

  describe('hostname', () => {
    it('returns initial hostname when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.hostname).toEqual(initialState.hostname);
    });

    it('maps hostname', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ hostname: 'my-server.example.com' }),
      );
      expect(result.hostname).toBe('my-server.example.com');
    });
  });

  describe('firewall', () => {
    it('returns initial firewall when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.firewall).toEqual(initialState.firewall);
    });

    it('maps ports and services', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          firewall: {
            ports: ['22:tcp', '443:tcp'],
            services: {
              enabled: ['ssh', 'https'],
              disabled: ['telnet'],
            },
          },
        }),
      );
      expect(result.firewall).toEqual({
        ports: ['22:tcp', '443:tcp'],
        services: {
          enabled: ['ssh', 'https'],
          disabled: ['telnet'],
        },
      });
    });

    it('defaults missing arrays to empty', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ firewall: {} }),
      );
      expect(result.firewall).toEqual({
        ports: [],
        services: {
          enabled: [],
          disabled: [],
        },
      });
    });
  });

  describe('firstBoot', () => {
    it('returns initial firstBoot when no files provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.firstBoot).toEqual(initialState.firstBoot);
    });

    it('returns initial firstBoot when files array is empty', () => {
      const result = parseSystemFromRequest(withCustomizations({ files: [] }));
      expect(result.firstBoot).toEqual(initialState.firstBoot);
    });

    it('returns initial firstBoot when no file matches FIRSTBOOT_PATH', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          files: [{ path: '/some/other/path', data: btoa('echo hello') }],
        }),
      );
      expect(result.firstBoot).toEqual(initialState.firstBoot);
    });

    it('returns initial firstBoot when firstboot file has no data', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ files: [{ path: FIRSTBOOT_PATH }] }),
      );
      expect(result.firstBoot).toEqual(initialState.firstBoot);
    });

    it('decodes base64 firstboot script', () => {
      const script = '#!/bin/bash\necho "first boot"';
      const result = parseSystemFromRequest(
        withCustomizations({
          files: [{ path: FIRSTBOOT_PATH, data: btoa(script) }],
        }),
      );
      expect(result.firstBoot).toEqual({ script });
    });

    it('finds firstboot file among multiple files', () => {
      const script = '#!/bin/bash\nsetup.sh';
      const result = parseSystemFromRequest(
        withCustomizations({
          files: [
            { path: '/etc/motd', data: btoa('welcome') },
            { path: FIRSTBOOT_PATH, data: btoa(script) },
            { path: '/etc/hosts', data: btoa('127.0.0.1 localhost') },
          ],
        }),
      );
      expect(result.firstBoot).toEqual({ script });
    });
  });

  describe('users', () => {
    it('returns initial users when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.users).toEqual(initialState.users);
    });

    it('returns initial users when array is empty', () => {
      const result = parseSystemFromRequest(withCustomizations({ users: [] }));
      expect(result.users).toEqual(initialState.users);
    });

    it('maps user name and defaults password to empty string', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result.users[0].name).toBe('admin');
      expect(result.users[0].password).toBe('');
    });

    it('maps ssh_key, defaulting to empty string', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [{ name: 'admin', ssh_key: 'ssh-rsa AAAA...' }],
        }),
      );
      expect(result.users[0].ssh_key).toBe('ssh-rsa AAAA...');

      const result2 = parseSystemFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].ssh_key).toBe('');
    });

    it('maps groups, defaulting to empty array', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [{ name: 'admin', groups: ['wheel', 'docker'] }],
        }),
      );
      expect(result.users[0].groups).toEqual(['wheel', 'docker']);

      const result2 = parseSystemFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].groups).toEqual([]);
    });

    it('sets isAdministrator true when user is in wheel group', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [{ name: 'admin', groups: ['wheel', 'docker'] }],
        }),
      );
      expect(result.users[0].isAdministrator).toBe(true);
    });

    it('sets isAdministrator false when user is not in wheel group', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [{ name: 'regular', groups: ['docker'] }],
        }),
      );
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('sets isAdministrator false when groups is undefined', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ users: [{ name: 'nogroups' }] }),
      );
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('maps hasPassword flag', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [{ name: 'admin', hasPassword: true }],
        }),
      );
      expect(result.users[0].hasPassword).toBe(true);

      const result2 = parseSystemFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].hasPassword).toBe(false);
    });

    it('maps multiple users', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          users: [
            {
              name: 'admin',
              groups: ['wheel'],
              ssh_key: 'ssh-rsa key',
              hasPassword: true,
            },
            {
              name: 'deploy',
              groups: ['docker'],
              ssh_key: 'ssh-ed25519 BBB',
            },
          ],
        }),
      );
      expect(result.users).toHaveLength(2);
      expect(result.users[0].name).toBe('admin');
      expect(result.users[0].isAdministrator).toBe(true);
      expect(result.users[0].hasPassword).toBe(true);
      expect(result.users[1].name).toBe('deploy');
      expect(result.users[1].isAdministrator).toBe(false);
      expect(result.users[1].hasPassword).toBe(false);
    });
  });

  describe('groups', () => {
    it('returns initial groups when not provided', () => {
      const result = parseSystemFromRequest(withCustomizations({}));
      expect(result.groups).toEqual(initialState.groups);
    });

    it('returns initial groups when array is empty', () => {
      const result = parseSystemFromRequest(withCustomizations({ groups: [] }));
      expect(result.groups).toEqual(initialState.groups);
    });

    it('maps group name', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ groups: [{ name: 'developers' }] }),
      );
      expect(result.groups).toEqual([{ name: 'developers' }]);
    });

    it('includes gid when defined', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          groups: [{ name: 'developers', gid: 1001 }],
        }),
      );
      expect(result.groups).toEqual([{ name: 'developers', gid: 1001 }]);
    });

    it('omits gid when undefined', () => {
      const result = parseSystemFromRequest(
        withCustomizations({ groups: [{ name: 'developers' }] }),
      );
      expect(result.groups[0]).not.toHaveProperty('gid');
    });

    it('maps multiple groups with mixed gid presence', () => {
      const result = parseSystemFromRequest(
        withCustomizations({
          groups: [
            { name: 'developers', gid: 1001 },
            { name: 'ops' },
            { name: 'dba', gid: 1003 },
          ],
        }),
      );
      expect(result.groups).toEqual([
        { name: 'developers', gid: 1001 },
        { name: 'ops' },
        { name: 'dba', gid: 1003 },
      ]);
    });
  });

  describe('combined customizations', () => {
    it('parses all fields from a fully populated customizations object', () => {
      const script = '#!/bin/bash\ninit';
      const result = parseSystemFromRequest(
        withCustomizations({
          services: {
            enabled: ['httpd'],
            disabled: ['cups'],
            masked: ['bluetooth'],
          },
          kernel: { name: 'kernel-rt', append: 'nosmt=force audit=1' },
          locale: { languages: ['en_US.UTF-8'], keyboard: 'us' },
          timezone: {
            timezone: 'UTC',
            ntpservers: ['0.pool.ntp.org'],
          },
          hostname: 'webserver',
          firewall: {
            ports: ['80:tcp'],
            services: { enabled: ['http'], disabled: ['ftp'] },
          },
          files: [{ path: FIRSTBOOT_PATH, data: btoa(script) }],
          users: [
            {
              name: 'admin',
              groups: ['wheel'],
              ssh_key: 'ssh-rsa key',
              hasPassword: true,
            },
          ],
          groups: [{ name: 'devs', gid: 1001 }],
        }),
      );

      expect(result.services).toEqual({
        enabled: ['httpd'],
        disabled: ['cups'],
        masked: ['bluetooth'],
      });
      expect(result.kernel).toEqual({
        name: 'kernel-rt',
        append: ['nosmt=force', 'audit=1'],
      });
      expect(result.locale).toEqual({
        languages: ['en_US.UTF-8'],
        keyboard: 'us',
      });
      expect(result.timezone).toEqual({
        timezone: 'UTC',
        ntpservers: ['0.pool.ntp.org'],
      });
      expect(result.hostname).toBe('webserver');
      expect(result.firewall).toEqual({
        ports: ['80:tcp'],
        services: { enabled: ['http'], disabled: ['ftp'] },
      });
      expect(result.firstBoot).toEqual({ script });
      expect(result.users).toEqual([
        {
          name: 'admin',
          password: '',
          ssh_key: 'ssh-rsa key',
          groups: ['wheel'],
          isAdministrator: true,
          hasPassword: true,
        },
      ]);
      expect(result.groups).toEqual([{ name: 'devs', gid: 1001 }]);
    });
  });
});
