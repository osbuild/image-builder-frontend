import { describe, expect, it } from 'vitest';

import {
  validateNtpServers,
  validateTimezone,
  validateTimezoneValue,
} from '@/store/slices/wizard';

describe('timezone validation', () => {
  describe('timezone values', () => {
    it('accepts an empty timezone', () => {
      expect(validateTimezoneValue('')).toEqual([]);
    });

    it('accepts a timezone from the supported timezone list', () => {
      expect(validateTimezoneValue('Europe/Amsterdam')).toEqual([]);
    });

    it('accepts the default UTC timezone', () => {
      expect(validateTimezoneValue('Etc/UTC')).toEqual([]);
    });

    it('rejects an unknown timezone', () => {
      expect(validateTimezoneValue('Invalid/Timezone')).toEqual([
        {
          kind: 'format',
          message: 'Unknown timezone',
          value: 'Invalid/Timezone',
        },
      ]);
    });
  });

  describe('NTP servers', () => {
    describe('valid servers', () => {
      it('accepts a hostname', () => {
        expect(validateNtpServers(['time.example.com'])).toEqual([]);
      });

      it('accepts an IPv4 address', () => {
        expect(validateNtpServers(['192.0.2.1'])).toEqual([]);
      });

      it('accepts an IPv6 address', () => {
        expect(validateNtpServers(['2001:db8::1'])).toEqual([]);
      });

      it('accepts multiple servers', () => {
        expect(
          validateNtpServers(['0.pool.ntp.org', '1.pool.ntp.org']),
        ).toEqual([]);
      });

      it('accepts an empty server list', () => {
        expect(validateNtpServers([])).toEqual([]);
      });

      it('accepts an omitted server list', () => {
        expect(validateNtpServers()).toEqual([]);
      });
    });

    describe('invalid servers', () => {
      it('rejects a server containing spaces', () => {
        expect(validateNtpServers(['not a server'])).toEqual([
          {
            kind: 'format',
            message: 'Expected format: <ntp-server>. Example: time.redhat.com',
            value: 'not a server',
          },
        ]);
      });

      it('rejects an empty server value', () => {
        expect(validateNtpServers([''])).toHaveLength(1);
      });

      it('rejects a server with uppercase characters', () => {
        expect(validateNtpServers(['TIME.EXAMPLE.COM'])).toHaveLength(1);
      });

      it('rejects a list containing an invalid server', () => {
        const result = validateNtpServers(['time.example.com', 'not a server']);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          kind: 'format',
          value: 'not a server',
        });
      });

      it('flags duplicate servers', () => {
        expect(
          validateNtpServers(['time.example.com', 'time.example.com']),
        ).toEqual([
          {
            kind: 'duplicate',
            message: 'Duplicate ntp servers: time.example.com',
            value: 'time.example.com',
          },
        ]);
      });
    });
  });

  describe('timezone objects', () => {
    it('accepts an object without optional values', () => {
      expect(validateTimezone({})).toEqual([]);
    });

    it('accepts a timezone with NTP servers', () => {
      expect(
        validateTimezone({
          timezone: 'Europe/Amsterdam',
          ntpservers: ['time.example.com'],
        }),
      ).toEqual([]);
    });

    it('reports invalid values in the timezone object', () => {
      const result = validateTimezone({
        timezone: 'Invalid/Timezone',
        ntpservers: ['not a server'],
      });

      expect(result).toHaveLength(2);
      expect(result.map(({ message }) => message)).toEqual([
        'Unknown timezone',
        'Expected format: <ntp-server>. Example: time.redhat.com',
      ]);
    });
  });
});
