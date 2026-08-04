import { describe, expect, it } from 'vitest';

import {
  changeAapEnabled,
  changeRegistrationType,
  initialState,
  type WizardState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { clearUnsupportedRegistration } from '../listeners';

const createState = (
  mode: 'image' | 'package',
  registration: Partial<WizardState['registration']> = {},
) =>
  createMockState({
    details: {
      ...initialState.details,
      blueprint: { ...initialState.details.blueprint, mode },
    },
    registration: { ...initialState.registration, ...registration },
  });

describe('clearUnsupportedRegistration', () => {
  it('resets satellite registration when switching to image mode', () => {
    const listenerApi = createListenerApi(
      createState('image', { type: 'register-satellite' }),
    );

    clearUnsupportedRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      changeRegistrationType(initialState.registration.type),
    );
  });

  it('disables AAP registration when switching to image mode', () => {
    const listenerApi = createListenerApi(
      createState('image', {
        aap: { ...initialState.registration.aap, enabled: true },
      }),
    );

    clearUnsupportedRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(changeAapEnabled(false));
  });

  it('leaves the registration untouched in package mode', () => {
    const listenerApi = createListenerApi(
      createState('package', {
        type: 'register-satellite',
        aap: { ...initialState.registration.aap, enabled: true },
      }),
    );

    clearUnsupportedRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not reset a supported registration in image mode', () => {
    const listenerApi = createListenerApi(
      createState('image', { type: 'register-now-rhc' }),
    );

    clearUnsupportedRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
