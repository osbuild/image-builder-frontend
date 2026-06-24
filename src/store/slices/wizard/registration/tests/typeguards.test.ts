import { describe, expect, it } from 'vitest';

import { REGISTER_NOW_TYPES } from '../constants';
import { isRegisterNowType } from '../typeguards';
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
