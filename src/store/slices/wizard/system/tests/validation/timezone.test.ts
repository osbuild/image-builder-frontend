import { describe, expect, it } from 'vitest';

import { timezones } from '@/Components/CreateImageWizard/steps/Timezone/timezonesList';
import { isNtpServerValid } from '@/Components/CreateImageWizard/validators';

const isTimezoneValid = (timezone: string) =>
  timezone === '' || timezones.includes(timezone);

const isNtpServerListValid = (servers: string[]) =>
  servers.every((server) => isNtpServerValid(server));

describe('timezone validation', () => {
  describe('timezones', () => {
    it('accepts an empty timezone', () => {
      expect(isTimezoneValid('')).toBe(true);
    });

    it('accepts a timezone from the supported timezone list', () => {
      expect(isTimezoneValid('Europe/Amsterdam')).toBe(true);
    });

    it('accepts the default UTC timezone', () => {
      expect(isTimezoneValid('Etc/UTC')).toBe(true);
    });

    it('rejects an unknown timezone', () => {
      expect(isTimezoneValid('Invalid/Timezone')).toBe(false);
    });
  });

  describe('NTP servers', () => {
    describe('valid servers', () => {
      it('accepts a hostname', () => {
        expect(isNtpServerListValid(['time.example.com'])).toBe(true);
      });

      it('accepts an IPv4 address', () => {
        expect(isNtpServerListValid(['192.0.2.1'])).toBe(true);
      });

      it('accepts an IPv6 address', () => {
        expect(isNtpServerListValid(['2001:db8::1'])).toBe(true);
      });

      it('accepts multiple servers', () => {
        expect(isNtpServerListValid(['0.pool.ntp.org', '1.pool.ntp.org'])).toBe(
          true,
        );
      });

      it('accepts an empty server list', () => {
        expect(isNtpServerListValid([])).toBe(true);
      });
    });

    describe('invalid servers', () => {
      it('rejects a server containing spaces', () => {
        expect(isNtpServerListValid(['not a server'])).toBe(false);
      });

      it('rejects a server without a hostname or address', () => {
        expect(isNtpServerListValid([''])).toBe(false);
      });

      it('rejects a server with uppercase characters', () => {
        expect(isNtpServerListValid(['TIME.EXAMPLE.COM'])).toBe(false);
      });

      it('rejects a list containing an invalid server', () => {
        expect(isNtpServerListValid(['time.example.com', 'not a server'])).toBe(
          false,
        );
      });
    });
  });
});
