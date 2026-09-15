import { describe, expect, it } from 'vitest';

import {
  validateNtpServers,
  validateTimezone,
  validateTimezoneValue,
} from '@/store/slices/wizard';

describe('timezone validation', () => {
  describe('timezone values', () => {
    it('accepts an empty timezone', () => {
      expect(validateTimezoneValue('').errors).toEqual([]);
    });

    it('accepts a timezone from the supported timezone list', () => {
      expect(validateTimezoneValue('Europe/Amsterdam').errors).toEqual([]);
    });

    it('accepts the default UTC timezone', () => {
      expect(validateTimezoneValue('Etc/UTC').errors).toEqual([]);
    });

    it('rejects an unknown timezone', () => {
      expect(validateTimezoneValue('Invalid/Timezone').errors).toEqual([
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
        expect(validateNtpServers(['time.example.com']).errors).toEqual([]);
      });

      it('accepts an IPv4 address', () => {
        expect(validateNtpServers(['192.0.2.1']).errors).toEqual([]);
      });

      it('accepts an IPv6 address', () => {
        expect(validateNtpServers(['2001:db8::1']).errors).toEqual([]);
      });

      it('accepts multiple servers', () => {
        expect(
          validateNtpServers(['0.pool.ntp.org', '1.pool.ntp.org']).errors,
        ).toEqual([]);
      });

      it('accepts an empty server list', () => {
        expect(validateNtpServers([]).errors).toEqual([]);
      });

      it('accepts an omitted server list', () => {
        expect(validateNtpServers().errors).toEqual([]);
      });
    });

    describe('invalid servers', () => {
      it('rejects a server containing spaces', () => {
        expect(validateNtpServers(['not a server']).errors).toEqual([
          {
            kind: 'format',
            message: 'Expected format: <ntp-server>. Example: time.redhat.com',
            value: 'not a server',
          },
        ]);
      });

      it('rejects an empty server value', () => {
        expect(validateNtpServers(['']).errors).toHaveLength(1);
      });

      it('rejects a server with uppercase characters', () => {
        expect(validateNtpServers(['TIME.EXAMPLE.COM']).errors).toHaveLength(1);
      });

      it('rejects a list containing an invalid server', () => {
        const { errors } = validateNtpServers([
          'time.example.com',
          'not a server',
        ]);

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({
          kind: 'format',
          value: 'not a server',
        });
      });

      it('flags duplicate servers', () => {
        expect(
          validateNtpServers(['time.example.com', 'time.example.com']).errors,
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
      expect(validateTimezone({}).errors).toEqual([]);
    });

    it('accepts a timezone with NTP servers', () => {
      expect(
        validateTimezone({
          timezone: 'Europe/Amsterdam',
          ntpservers: ['time.example.com'],
        }).errors,
      ).toEqual([]);
    });

    it('reports invalid values in the timezone object', () => {
      const { errors } = validateTimezone({
        timezone: 'Invalid/Timezone',
        ntpservers: ['not a server'],
      });

      expect(errors).toHaveLength(2);
      expect(errors.map(({ message }) => message)).toEqual([
        'Unknown timezone',
        'Expected format: <ntp-server>. Example: time.redhat.com',
      ]);
    });
  });
});
