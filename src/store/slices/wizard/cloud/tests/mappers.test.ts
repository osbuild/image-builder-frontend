import { describe, expect, it } from 'vitest';

import type { RootState } from '@/store';
import { initialState } from '@/store/slices/wizard';

import { mapAwsImageOptions } from '..';

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
