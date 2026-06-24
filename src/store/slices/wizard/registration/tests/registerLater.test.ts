import { describe, expect, it } from 'vitest';

import { changeRegistrationType, initialState } from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { registerLater } from '../../listeners';

const ORIGINAL_ENV = process.env;

describe('registerLater', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('dispatches register-later for non-RHEL on-premise', () => {
    process.env = { ...ORIGINAL_ENV, IS_ON_PREMISE: 'true' };
    const state = createMockState({
      output: {
        ...initialState.output,
        distribution: 'centos-9',
      },
    });
    const listenerApi = createListenerApi(state);

    registerLater({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      changeRegistrationType('register-later'),
    );
  });

  it('does not dispatch for RHEL on-premise', () => {
    process.env = { ...ORIGINAL_ENV, IS_ON_PREMISE: 'true' };
    const state = createMockState({
      output: {
        ...initialState.output,
        distribution: 'rhel-10',
      },
    });
    const listenerApi = createListenerApi(state);

    registerLater({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when not on-premise', () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.IS_ON_PREMISE;
    const state = createMockState({
      output: {
        ...initialState.output,
        distribution: 'centos-9',
      },
    });
    const listenerApi = createListenerApi(state);

    registerLater({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
