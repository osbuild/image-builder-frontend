import { describe, expect, it, vi } from 'vitest';

import { type Architectures, backendApi } from '@/store/api/backend';
import { changeImageTypes, initialState } from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { filterImageTypes } from '../listeners';

const mockArchitecturesSelector = (data: Architectures) => {
  const selectSpy = vi.spyOn(backendApi.endpoints.getArchitectures, 'select');
  selectSpy.mockReturnValue((() => ({ data })) as unknown as ReturnType<
    typeof backendApi.endpoints.getArchitectures.select
  >);
  return selectSpy;
};

describe('filterImageTypes', () => {
  it('returns early when in image mode', () => {
    const state = createMockState({
      details: {
        ...initialState.details,
        blueprint: {
          ...initialState.details.blueprint,
          mode: 'image',
        },
      },
    });
    const listenerApi = createListenerApi(state);

    filterImageTypes({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('filters image types to only those allowed by getArchitectures', () => {
    const state = createMockState({
      output: {
        ...initialState.output,
        architecture: 'x86_64',
        distribution: 'rhel-10',
        imageTypes: ['aws', 'gcp', 'vsphere'],
      },
    });

    const selectSpy = mockArchitecturesSelector([
      { arch: 'x86_64', image_types: ['aws', 'vsphere'], repositories: [] },
    ]);
    const listenerApi = createListenerApi(state);

    filterImageTypes({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      changeImageTypes(['aws', 'vsphere']),
    );

    selectSpy.mockRestore();
  });

  it('clears all image types when architecture has no matches', () => {
    const state = createMockState({
      output: {
        ...initialState.output,
        architecture: 'aarch64',
        distribution: 'rhel-10',
        imageTypes: ['aws', 'gcp'],
      },
    });

    const selectSpy = mockArchitecturesSelector([
      { arch: 'x86_64', image_types: ['aws'], repositories: [] },
    ]);
    const listenerApi = createListenerApi(state);

    filterImageTypes({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(changeImageTypes([]));

    selectSpy.mockRestore();
  });
});
