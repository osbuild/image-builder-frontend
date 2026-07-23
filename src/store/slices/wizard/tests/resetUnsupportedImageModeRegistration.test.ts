import { describe, expect, it } from 'vitest';

import {
  changeAapEnabled,
  changeRegistrationType,
  initialState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { resetUnsupportedImageModeRegistration } from '../listeners';

const imageModeDetails = {
  ...initialState.details,
  blueprint: {
    ...initialState.details.blueprint,
    mode: 'image' as const,
  },
};

describe('resetUnsupportedImageModeRegistration', () => {
  it('does nothing in package mode', () => {
    const state = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
        aap: { ...initialState.registration.aap, enabled: true },
      },
    });
    const listenerApi = createListenerApi(state);

    resetUnsupportedImageModeRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('resets satellite registration when switching to image mode', () => {
    const state = createMockState({
      details: imageModeDetails,
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
      },
    });
    const listenerApi = createListenerApi(state);

    resetUnsupportedImageModeRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      changeRegistrationType('register-now-rhc'),
    );
  });

  it('disables AAP registration when switching to image mode', () => {
    const state = createMockState({
      details: imageModeDetails,
      registration: {
        ...initialState.registration,
        aap: { ...initialState.registration.aap, enabled: true },
      },
    });
    const listenerApi = createListenerApi(state);

    resetUnsupportedImageModeRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(changeAapEnabled(false));
  });

  it('keeps supported registration types when switching to image mode', () => {
    const state = createMockState({
      details: imageModeDetails,
      registration: {
        ...initialState.registration,
        type: 'register-now-rhc',
      },
    });
    const listenerApi = createListenerApi(state);

    resetUnsupportedImageModeRegistration({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
