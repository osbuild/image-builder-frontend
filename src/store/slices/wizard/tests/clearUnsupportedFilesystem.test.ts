import { describe, expect, it } from 'vitest';

import {
  changeFscMode,
  type FilesystemMode,
  initialState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { clearUnsupportedFilesystem } from '../listeners';

const createState = (mode: 'image' | 'package', fscMode: FilesystemMode) =>
  createMockState({
    details: {
      ...initialState.details,
      blueprint: { ...initialState.details.blueprint, mode },
    },
    filesystem: { ...initialState.filesystem, mode: fscMode },
  });

describe('clearUnsupportedFilesystem', () => {
  it('resets basic partitioning when switching to image mode', () => {
    const listenerApi = createListenerApi(createState('image', 'basic'));

    clearUnsupportedFilesystem({} as never, listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(
      changeFscMode('automatic'),
    );
  });

  it('leaves basic partitioning untouched in package mode', () => {
    const listenerApi = createListenerApi(createState('package', 'basic'));

    clearUnsupportedFilesystem({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not reset advanced partitioning in image mode', () => {
    const listenerApi = createListenerApi(createState('image', 'advanced'));

    clearUnsupportedFilesystem({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
