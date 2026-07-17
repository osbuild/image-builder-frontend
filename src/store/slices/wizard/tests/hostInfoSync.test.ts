import { describe, expect, it, vi } from 'vitest';

import type { RootState } from '@/store';
import {
  changeArchitecture,
  changeDistribution,
  initializeWizard,
} from '@/store/slices/wizard';

import { createListenerApi, mockRootState } from './mockWizardState';

import { applyHostInfo } from '../listeners';

const ORIGINAL_ENV = process.env;

// Constructs an action matching composerApi.endpoints.getHostInfo.matchFulfilled.
// RTK Query fulfilled actions use:
//   type: `${reducerPath}/executeQuery/fulfilled`
//   meta.arg.endpointName: endpoint name
const createHostInfoFulfilledAction = (payload: {
  arch: string;
  distro: string;
}) => ({
  type: 'onPremApi/executeQuery/fulfilled' as const,
  payload,
  meta: {
    arg: {
      endpointName: 'getHostInfo' as const,
      type: 'query' as const,
      queryCacheKey: 'getHostInfo(undefined)',
      originalArgs: undefined,
    },
    requestId: 'test-request-id',
    requestStatus: 'fulfilled' as const,
  },
});

// Minimal RTK Query cache state for the onPremApi slice.
// When hostInfo is provided, seeds the getHostInfo cache entry.
const createOnPremApiCache = (hostInfo?: { arch: string; distro: string }) => ({
  queries: hostInfo
    ? {
        'getHostInfo(undefined)': {
          status: 'fulfilled',
          data: hostInfo,
          endpointName: 'getHostInfo',
          requestId: 'test',
          startedTimeStamp: 0,
          fulfilledTimeStamp: 0,
        },
      }
    : {},
  mutations: {},
  provided: {},
  subscriptions: {},
  config: {
    online: true,
    focused: true,
    middlewareRegistered: true,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
    keepUnusedDataFor: 60,
    reducerPath: 'onPremApi' as const,
    invalidationBehavior: 'delayed',
  },
});

describe('host info store sync', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  describe('matchFulfilled handler (reducer)', () => {
    it('sets architecture and distribution when getHostInfo fulfills on-premise', async () => {
      process.env = { ...ORIGINAL_ENV, IS_ON_PREMISE: 'true' };
      vi.resetModules();

      const { wizardReducer, initialState } =
        await import('@/store/slices/wizard');

      const action = createHostInfoFulfilledAction({
        arch: 'aarch64',
        distro: 'rhel-9',
      });

      const result = wizardReducer(initialState, action);

      expect(result.output.architecture).toBe('aarch64');
      expect(result.output.distribution).toBe('rhel-9');
    });

    it('does not update state when not on-premise', async () => {
      delete process.env.IS_ON_PREMISE;
      vi.resetModules();

      const { wizardReducer, initialState } =
        await import('@/store/slices/wizard');

      const action = createHostInfoFulfilledAction({
        arch: 'aarch64',
        distro: 'rhel-9',
      });

      const result = wizardReducer(initialState, action);

      expect(result.output.architecture).toBe(initialState.output.architecture);
      expect(result.output.distribution).toBe(initialState.output.distribution);
    });
  });

  describe('applyHostInfo listener', () => {
    it('dispatches changeArchitecture and changeDistribution from cached host info', () => {
      process.env = { ...ORIGINAL_ENV, IS_ON_PREMISE: 'true' };

      const state = {
        ...mockRootState,
        onPremApi: createOnPremApiCache({
          arch: 'aarch64',
          distro: 'rhel-9',
        }),
      } as unknown as RootState;

      const listenerApi = createListenerApi(state);

      applyHostInfo(initializeWizard(), listenerApi);

      expect(listenerApi.dispatch).toHaveBeenCalledWith(
        changeArchitecture('aarch64'),
      );
      expect(listenerApi.dispatch).toHaveBeenCalledWith(
        changeDistribution('rhel-9'),
      );
    });

    it('does not dispatch when cache has no data', () => {
      process.env = { ...ORIGINAL_ENV, IS_ON_PREMISE: 'true' };

      const state = {
        ...mockRootState,
        onPremApi: createOnPremApiCache(),
      } as unknown as RootState;

      const listenerApi = createListenerApi(state);

      applyHostInfo(initializeWizard(), listenerApi);

      expect(listenerApi.dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch when not on-premise', () => {
      delete process.env.IS_ON_PREMISE;

      const state = {
        ...mockRootState,
        onPremApi: createOnPremApiCache({
          arch: 'aarch64',
          distro: 'rhel-9',
        }),
      } as unknown as RootState;

      const listenerApi = createListenerApi(state);

      applyHostInfo(initializeWizard(), listenerApi);

      expect(listenerApi.dispatch).not.toHaveBeenCalled();
    });
  });
});
