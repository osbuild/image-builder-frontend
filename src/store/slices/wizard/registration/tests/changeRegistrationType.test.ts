import { describe, expect, it } from 'vitest';

import { changeRegistrationType, registrationSlice } from '../slice';
import {
  emptyAapState,
  emptyRegistrationState,
  emptySatelliteState,
  initialState,
} from '../state';
import type { RegistrationSlice } from '../types';

const populatedState: RegistrationSlice = {
  ...initialState,
  options: {
    ...emptyRegistrationState,
    activationKey: 'old-key',
    orgId: '1234',
  },
  satellite: {
    ...emptySatelliteState,
    command: 'old-command',
    caCerts: ['old-certificate'],
  },
  aap: {
    ...emptyAapState,
    callbackUrl: 'https://example.com',
  },
};

describe('changeRegistrationType', () => {
  it('clears method-specific values when switching to register later', () => {
    const state = registrationSlice.reducer(
      populatedState,
      changeRegistrationType('register-later'),
    );

    expect(state).toMatchObject({
      type: 'register-later',
      options: undefined,
      satellite: undefined,
      aap: populatedState.aap,
    });
  });

  it('reinitializes registration options when switching to register now', () => {
    const state = registrationSlice.reducer(
      { ...populatedState, type: 'register-later' },
      changeRegistrationType('register-now'),
    );

    expect(state).toMatchObject({
      type: 'register-now',
      options: emptyRegistrationState,
      satellite: undefined,
      aap: populatedState.aap,
    });
  });

  it('reinitializes satellite values when switching to satellite registration', () => {
    const state = registrationSlice.reducer(
      populatedState,
      changeRegistrationType('register-satellite'),
    );

    expect(state).toMatchObject({
      type: 'register-satellite',
      options: undefined,
      satellite: emptySatelliteState,
      aap: populatedState.aap,
    });
  });

  it('does not clear values when the registration type is unchanged', () => {
    const currentState = {
      ...populatedState,
      type: 'register-now' as const,
      satellite: undefined,
    };
    const state = registrationSlice.reducer(
      currentState,
      changeRegistrationType('register-now'),
    );

    expect(state).toEqual(currentState);
  });

  it('clears inactive values when the unchanged type is not register now', () => {
    const state = registrationSlice.reducer(
      populatedState,
      changeRegistrationType('register-later'),
    );

    expect(state.options).toBeUndefined();
    expect(state.satellite).toBeUndefined();
  });
});
