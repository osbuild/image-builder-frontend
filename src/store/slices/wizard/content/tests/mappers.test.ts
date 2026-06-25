import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapContentCustomizations } from '../mappers';
import { initialState } from '../state';
import type { ContentSlice } from '../types';

const createState = (overrides: Partial<ContentSlice> = {}) =>
  createMockState({
    content: { ...initialState, ...overrides },
  });

describe('mapContentCustomizations', () => {
  it('returns empty object when content is default', () => {
    const state = createState();
    expect(mapContentCustomizations(state)).toEqual({});
  });

  describe('packages', () => {
    it('includes packages when present', () => {
      const state = createState({
        packages: [
          { name: 'vim', summary: 'editor', repository: 'distro' },
          { name: 'curl', summary: 'transfer', repository: 'distro' },
        ],
      });
      const result = mapContentCustomizations(state);
      expect(result.packages).toEqual(expect.arrayContaining(['vim', 'curl']));
    });

    it('prefixes groups with @', () => {
      const state = createState({
        groups: [
          {
            name: 'development',
            description: 'dev tools',
            repository: 'distro',
          },
        ],
      });
      const result = mapContentCustomizations(state);
      expect(result.packages).toContain('@development');
    });

    it('deduplicates packages and langpacks', () => {
      const state = createState({
        packages: [{ name: 'glibc', summary: '', repository: 'distro' }],
        verifiedLocaleLangpacks: ['glibc', 'langpack-en'],
      });
      const result = mapContentCustomizations(state);
      expect(result.packages).toEqual(
        expect.arrayContaining(['glibc', 'langpack-en']),
      );
      const glibcCount = result.packages!.filter(
        (p: string) => p === 'glibc',
      ).length;
      expect(glibcCount).toBe(1);
    });

    it('omits packages key when none are set', () => {
      const state = createState();
      expect(mapContentCustomizations(state)).not.toHaveProperty('packages');
    });
  });

  describe('modules', () => {
    it('includes enabled_modules when present', () => {
      const state = createState({
        enabledModules: [{ name: 'nodejs', stream: '18' }],
      });
      expect(mapContentCustomizations(state)).toEqual(
        expect.objectContaining({
          enabled_modules: [{ name: 'nodejs', stream: '18' }],
        }),
      );
    });

    it('omits enabled_modules key when empty', () => {
      const state = createState();
      expect(mapContentCustomizations(state)).not.toHaveProperty(
        'enabled_modules',
      );
    });
  });

  describe('repositories', () => {
    it('includes custom_repositories with cleaned baseurl', () => {
      const state = createState({
        repositories: {
          ...initialState.repositories,
          customRepositories: [
            {
              id: 'repo-1',
              name: 'My Repo',
              baseurl: ['https://example.com/repo'],
              check_gpg: false,
            },
          ],
        },
      });
      const result = mapContentCustomizations(state);
      expect(result.custom_repositories).toEqual([
        {
          id: 'repo-1',
          name: 'My Repo',
          baseurl: ['https://example.com/repo'],
          check_gpg: false,
        },
      ]);
    });

    it('sets baseurl to undefined when empty array', () => {
      const state = createState({
        repositories: {
          ...initialState.repositories,
          customRepositories: [
            {
              id: 'repo-1',
              name: 'My Repo',
              baseurl: [],
              check_gpg: false,
            },
          ],
        },
      });
      const result = mapContentCustomizations(state);
      expect(result.custom_repositories![0].baseurl).toBeUndefined();
    });

    it('omits custom_repositories key when empty', () => {
      const state = createState();
      expect(mapContentCustomizations(state)).not.toHaveProperty(
        'custom_repositories',
      );
    });

    it('omits payload_repositories key when empty', () => {
      const state = createState();
      expect(mapContentCustomizations(state)).not.toHaveProperty(
        'payload_repositories',
      );
    });

    it('includes payload_repositories when present', () => {
      const state = createState({
        repositories: {
          ...initialState.repositories,
          payloadRepositories: [
            {
              baseurl: 'https://example.com/payload',
              rhsm: false,
              check_gpg: false,
            },
          ],
        },
      });
      const result = mapContentCustomizations(state);
      expect(result.payload_repositories).toHaveLength(1);
    });
  });
});
