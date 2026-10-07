import { describe, expect, it } from 'vitest';

import {
  type CustomRepositoryWithFlag,
  type PayloadRepositoryWithFlag,
  selectAllRepositoryIds,
} from '@/store/slices/wizard';
import {
  createMockState,
  mockRootState,
} from '@/store/slices/wizard/tests/mockWizardState';

const customRepo = (
  id: string,
  isRecommended?: boolean,
): CustomRepositoryWithFlag => ({
  id,
  ...(isRecommended ? { isRecommended: true } : {}),
});

const payloadRepo = (
  overrides: Partial<PayloadRepositoryWithFlag> = {},
): PayloadRepositoryWithFlag => ({
  rhsm: false,
  ...overrides,
});

describe('selectAllRepositoryIds', () => {
  it('returns an empty array when all repository lists are empty', () => {
    expect(selectAllRepositoryIds(mockRootState)).toEqual([]);
  });

  it('collects ids from custom repositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          customRepositories: [customRepo('custom-1'), customRepo('custom-2')],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['custom-1', 'custom-2']);
  });

  it('collects ids from payload repositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          payloadRepositories: [
            payloadRepo({ id: 'payload-1' }),
            payloadRepo({ id: 'payload-2' }),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['payload-1', 'payload-2']);
  });

  it('includes recommended repos via their id in customRepositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          customRepositories: [
            customRepo('rec-1', true),
            customRepo('rec-2', true),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['rec-1', 'rec-2']);
  });

  it('deduplicates ids across custom and payload', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          customRepositories: [customRepo('shared-id')],
          payloadRepositories: [payloadRepo({ id: 'shared-id' })],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['shared-id']);
  });

  it('excludes undefined ids from payload repositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          payloadRepositories: [
            payloadRepo({ id: 'valid' }),
            payloadRepo({ id: undefined }),
            payloadRepo({}),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['valid']);
  });

  it('combines and deduplicates across all sources with undefined values', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          customRepositories: [customRepo('aaa'), customRepo('bbb')],
          payloadRepositories: [
            payloadRepo({ id: 'bbb' }),
            payloadRepo({}),
            payloadRepo({ id: 'ccc' }),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['aaa', 'bbb', 'ccc']);
  });
});
