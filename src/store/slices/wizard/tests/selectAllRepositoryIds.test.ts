import { describe, expect, it } from 'vitest';

import type { CustomRepository, Repository } from '@/store/api/backend';
import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import { selectAllRepositoryIds } from '@/store/slices/wizard';

import { createMockState, mockRootState } from './mockWizardState';

const customRepo = (id: string): CustomRepository => ({ id });

const payloadRepo = (overrides: Partial<Repository> = {}): Repository => ({
  rhsm: false,
  ...overrides,
});

const recommendedRepo = (
  overrides: Partial<ApiRepositoryResponseRead> = {},
): ApiRepositoryResponseRead => overrides;

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

  it('collects uuids from recommended repositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          recommendedRepositories: [
            recommendedRepo({ uuid: 'rec-1' }),
            recommendedRepo({ uuid: 'rec-2' }),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['rec-1', 'rec-2']);
  });

  it('deduplicates ids across all three sources', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          customRepositories: [customRepo('shared-id')],
          payloadRepositories: [payloadRepo({ id: 'shared-id' })],
          recommendedRepositories: [recommendedRepo({ uuid: 'shared-id' })],
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

  it('excludes undefined uuids from recommended repositories', () => {
    const state = createMockState({
      content: {
        ...mockRootState.wizard.content,
        repositories: {
          ...mockRootState.wizard.content.repositories,
          recommendedRepositories: [
            recommendedRepo({ uuid: 'valid' }),
            recommendedRepo({ uuid: undefined }),
            recommendedRepo({}),
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
          recommendedRepositories: [
            recommendedRepo({ uuid: 'ccc' }),
            recommendedRepo({}),
            recommendedRepo({ uuid: 'ddd' }),
          ],
        },
      },
    });

    expect(selectAllRepositoryIds(state)).toEqual(['aaa', 'bbb', 'ccc', 'ddd']);
  });
});
