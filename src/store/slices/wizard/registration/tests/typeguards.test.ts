import { describe, expect, it } from 'vitest';

import { SATELLITE_PATH } from '@/constants';
import { Customizations } from '@/store/api/backend';

import { REGISTER_NOW_TYPES } from '../constants';
import {
  hasSatelliteCommand,
  hasSubscription,
  isRegisterNowType,
} from '../typeguards';
import type { RegistrationType } from '../types';

describe('isRegisterNowType', () => {
  it.each(REGISTER_NOW_TYPES)(
    'returns true for register-now type "%s"',
    (type) => {
      expect(isRegisterNowType(type)).toBe(true);
    },
  );

  const nonRegisterNowTypes: RegistrationType[] = [
    'register-later',
    'register-satellite',
    'register-aap',
  ];

  it.each(nonRegisterNowTypes)(
    'returns false for non-register-now type "%s"',
    (type) => {
      expect(isRegisterNowType(type)).toBe(false);
    },
  );
});

describe('hasSubscription', () => {
  it('returns true when subscription is present', () => {
    const customizations: Customizations = {
      subscription: {
        organization: 123,
        'activation-key': 'key-1',
        'server-url': 'https://sub.example.com',
        'base-url': 'https://cdn.example.com',
        insights: true,
      },
    };
    expect(hasSubscription(customizations)).toBe(true);
  });

  it('returns false when subscription is undefined', () => {
    const customizations: Customizations = {};
    expect(hasSubscription(customizations)).toBe(false);
  });
});

describe('hasSatelliteCommand', () => {
  it('returns true when files contain a satellite command with data', () => {
    const customizations: Customizations = {
      files: [{ path: SATELLITE_PATH, data: btoa('register-cmd') }],
    };
    expect(hasSatelliteCommand(customizations)).toBe(true);
  });

  it('returns false when files is undefined', () => {
    const customizations: Customizations = {};
    expect(hasSatelliteCommand(customizations)).toBe(false);
  });

  it('returns false when files is empty', () => {
    const customizations: Customizations = { files: [] };
    expect(hasSatelliteCommand(customizations)).toBe(false);
  });

  it('returns false when no file matches SATELLITE_PATH', () => {
    const customizations: Customizations = {
      files: [{ path: '/etc/motd', data: btoa('hello') }],
    };
    expect(hasSatelliteCommand(customizations)).toBe(false);
  });

  it('returns false when satellite file has no data', () => {
    const customizations: Customizations = {
      files: [{ path: SATELLITE_PATH }],
    };
    expect(hasSatelliteCommand(customizations)).toBe(false);
  });
});
