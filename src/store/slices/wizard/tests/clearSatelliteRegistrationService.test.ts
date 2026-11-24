import { describe, expect, it } from 'vitest';

import { SATELLITE_SERVICE } from '@/constants';
import { initialState, removeEnabledService } from '@/store/slices/wizard';
import { clearSatelliteRegistrationService } from '@/store/slices/wizard/listeners';

import { createListenerApi, createMockState } from './mockWizardState';

describe('clearSatelliteRegistrationService', () => {
  it('removes the Satellite service when leaving Satellite registration', () => {
    const previousState = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
      },
    });
    const currentState = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-now',
      },
    });
    const listenerApi = createListenerApi(currentState);
    listenerApi.getOriginalState.mockReturnValue(previousState);

    clearSatelliteRegistrationService({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      removeEnabledService(SATELLITE_SERVICE),
    );
  });

  it('does nothing when the registration type is unchanged', () => {
    const state = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
      },
    });
    const listenerApi = createListenerApi(state);

    clearSatelliteRegistrationService({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when entering Satellite registration', () => {
    const previousState = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-now',
      },
    });
    const currentState = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
      },
    });
    const listenerApi = createListenerApi(currentState);
    listenerApi.getOriginalState.mockReturnValue(previousState);

    clearSatelliteRegistrationService({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
