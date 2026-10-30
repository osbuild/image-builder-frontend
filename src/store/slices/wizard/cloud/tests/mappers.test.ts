import { describe, expect, it } from 'vitest';

import type { RootState } from '@/store';
import { initialState } from '@/store/slices/wizard';

import { mapAwsImageOptions, mapGcpImageOptions } from '..';

describe('AWS image options mapper', () => {
  it('maps the configured region for on-prem AWS without an account ID', () => {
    const state = {
      wizard: {
        ...initialState,
        cloudProviders: {
          ...initialState.cloudProviders,
          aws: {
            shareMethod: 'onprem',
            region: 'eu-west-1',
          },
        },
      },
    } as RootState;

    expect(mapAwsImageOptions(state)).toEqual({ region: 'eu-west-1' });
  });
});

describe('GCP image options mapper', () => {
  it('omits sharing options when the domain is empty', () => {
    const state = {
      wizard: {
        ...initialState,
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            domain: '',
          },
        },
      },
    } as RootState;

    expect(mapGcpImageOptions(state)).toEqual({});
  });
});
