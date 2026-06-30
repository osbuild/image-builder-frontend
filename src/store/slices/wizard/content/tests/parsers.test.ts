import { describe, expect, it } from 'vitest';

import {
  BlueprintExportResponse,
  BlueprintResponse,
  Customizations,
  Distributions,
} from '@/store/api/backend';

import { parseContentFromRequest } from '../parsers';
import { initialState } from '../state';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const createMinimalExport = (
  overrides: Partial<BlueprintExportResponse> = {},
): BlueprintExportResponse => ({
  name: 'exported-blueprint',
  description: 'An exported blueprint',
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  metadata: {
    parent_id: null,
    exported_at: '',
    is_on_prem: false,
  },
  ...overrides,
});

const emptyCustomizations: Customizations = {};

describe('parseContentFromRequest', () => {
  describe('edit mode (BlueprintResponse)', () => {
    it('returns initial state for empty customizations and image requests', () => {
      const result = parseContentFromRequest(
        createMinimalBlueprint({ customizations: emptyCustomizations }),
      );
      expect(result).toEqual(initialState);
    });

    describe('packages', () => {
      it('maps regular packages with empty summary and repository', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { packages: ['vim', 'git', 'curl'] },
          }),
        );
        expect(result.packages).toEqual([
          { name: 'vim', summary: '', repository: '' },
          { name: 'git', summary: '', repository: '' },
          { name: 'curl', summary: '', repository: '' },
        ]);
      });

      it('filters out @-prefixed group entries from packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              packages: ['vim', '@development-tools', 'git', '@base'],
            },
          }),
        );
        expect(result.packages).toEqual([
          { name: 'vim', summary: '', repository: '' },
          { name: 'git', summary: '', repository: '' },
        ]);
      });

      it('filters out langpacks-* entries from packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              packages: ['vim', 'langpacks-en', 'git', 'langpacks-fr'],
            },
          }),
        );
        expect(result.packages).toEqual([
          { name: 'vim', summary: '', repository: '' },
          { name: 'git', summary: '', repository: '' },
        ]);
      });

      it('filters out both @-prefixed and langpacks-* entries', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              packages: [
                'vim',
                '@development-tools',
                'langpacks-en',
                'git',
                '@base',
                'langpacks-fr',
              ],
            },
          }),
        );
        expect(result.packages).toEqual([
          { name: 'vim', summary: '', repository: '' },
          { name: 'git', summary: '', repository: '' },
        ]);
      });

      it('returns empty array when no packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({ customizations: emptyCustomizations }),
        );
        expect(result.packages).toEqual([]);
      });

      it('returns empty array when all packages are groups or langpacks', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { packages: ['@base', 'langpacks-en'] },
          }),
        );
        expect(result.packages).toEqual([]);
      });
    });

    describe('groups', () => {
      it('extracts @-prefixed entries as groups with name stripped of @', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              packages: ['@development-tools', '@base'],
            },
          }),
        );
        expect(result.groups).toEqual([
          {
            name: 'development-tools',
            description: '',
            repository: '',
            package_list: [],
          },
          {
            name: 'base',
            description: '',
            repository: '',
            package_list: [],
          },
        ]);
      });

      it('returns empty array when no @-prefixed entries', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { packages: ['vim', 'git'] },
          }),
        );
        expect(result.groups).toEqual([]);
      });

      it('returns empty array when no packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({ customizations: emptyCustomizations }),
        );
        expect(result.groups).toEqual([]);
      });
    });

    describe('enabledModules', () => {
      it('passes through enabled modules', () => {
        const modules = [
          { name: 'nodejs', stream: '18' },
          { name: 'ruby', stream: '3.1' },
        ];
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { enabled_modules: modules },
          }),
        );
        expect(result.enabledModules).toEqual(modules);
      });

      it('returns empty array when not provided', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({ customizations: emptyCustomizations }),
        );
        expect(result.enabledModules).toEqual([]);
      });
    });

    describe('repositories', () => {
      it('maps custom repositories', () => {
        const customRepos = [
          {
            id: 'repo-1',
            name: 'My Repo',
            baseurl: ['https://example.com/repo'],
          },
        ];
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { custom_repositories: customRepos },
          }),
        );
        expect(result.repositories.customRepositories).toEqual(customRepos);
      });

      it('maps payload repositories', () => {
        const payloadRepos = [
          { baseurl: 'https://example.com/payload', rhsm: false },
        ];
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { payload_repositories: payloadRepos },
          }),
        );
        expect(result.repositories.payloadRepositories).toEqual(payloadRepos);
      });

      it('defaults repositories to empty arrays when not provided', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({ customizations: emptyCustomizations }),
        );
        expect(result.repositories.customRepositories).toEqual([]);
        expect(result.repositories.payloadRepositories).toEqual([]);
        expect(result.repositories.recommendedRepositories).toEqual([]);
        expect(result.repositories.redHatRepositories).toEqual([]);
      });

      it('always sets recommendedRepositories and redHatRepositories to empty', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              custom_repositories: [
                { id: 'r1', name: 'R1', baseurl: ['https://example.com'] },
              ],
              payload_repositories: [
                { baseurl: 'https://example.com', rhsm: false },
              ],
            },
          }),
        );
        expect(result.repositories.recommendedRepositories).toEqual([]);
        expect(result.repositories.redHatRepositories).toEqual([]);
      });
    });

    describe('snapshotting', () => {
      it('sets useLatest when no snapshot date and no template', () => {
        const result = parseContentFromRequest(createMinimalBlueprint());
        expect(result.snapshotting.useLatest).toBe(true);
        expect(result.snapshotting.snapshotDate).toBe('');
        expect(result.snapshotting.template).toBe('');
        expect(result.snapshotting.templateName).toBe('');
      });

      it('passes through RFC3339 snapshot date', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
                snapshot_date: '2025-11-26T00:00:00.000Z',
              },
            ],
          }),
        );
        expect(result.snapshotting.useLatest).toBe(false);
        expect(result.snapshotting.snapshotDate).toBe(
          '2025-11-26T00:00:00.000Z',
        );
      });

      it('converts DateOnly snapshot date to RFC3339', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
                snapshot_date: '2025-11-26',
              },
            ],
          }),
        );
        expect(result.snapshotting.useLatest).toBe(false);
        expect(result.snapshotting.snapshotDate).toBe('2025-11-26T00:00:00Z');
      });

      it('treats invalid snapshot date as empty', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
                snapshot_date: 'not-a-date',
              },
            ],
          }),
        );
        expect(result.snapshotting.snapshotDate).toBe('');
      });

      it('sets useLatest to false when content template is present', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
                content_template: 'template-id-123',
                content_template_name: 'My Template',
              },
            ],
          }),
        );
        expect(result.snapshotting.useLatest).toBe(false);
        expect(result.snapshotting.template).toBe('template-id-123');
        expect(result.snapshotting.templateName).toBe('My Template');
      });

      it('finds snapshot date from first image request that has one', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
              },
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: { type: 'aws.s3', options: {} },
                snapshot_date: '2025-06-15T00:00:00Z',
              },
            ],
          }),
        );
        expect(result.snapshotting.snapshotDate).toBe('2025-06-15T00:00:00Z');
      });

      it('defaults template fields to empty strings', () => {
        const result = parseContentFromRequest(createMinimalBlueprint());
        expect(result.snapshotting.template).toBe('');
        expect(result.snapshotting.templateName).toBe('');
      });
    });

    describe('verifiedLocaleLangpacks', () => {
      it('extracts langpacks-* entries from packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: {
              packages: ['vim', 'langpacks-en', 'langpacks-fr', 'git'],
            },
          }),
        );
        expect(result.verifiedLocaleLangpacks).toEqual([
          'langpacks-en',
          'langpacks-fr',
        ]);
      });

      it('returns empty array when no langpacks', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({
            customizations: { packages: ['vim', 'git'] },
          }),
        );
        expect(result.verifiedLocaleLangpacks).toEqual([]);
      });

      it('returns empty array when no packages', () => {
        const result = parseContentFromRequest(
          createMinimalBlueprint({ customizations: emptyCustomizations }),
        );
        expect(result.verifiedLocaleLangpacks).toEqual([]);
      });
    });
  });

  describe('import mode (BlueprintExportResponse)', () => {
    it('parses customizations the same as edit mode', () => {
      const result = parseContentFromRequest(
        createMinimalExport({
          customizations: {
            packages: ['vim', '@base', 'langpacks-en'],
            custom_repositories: [
              { id: 'r1', name: 'R1', baseurl: ['https://example.com'] },
            ],
            enabled_modules: [{ name: 'nodejs', stream: '18' }],
          },
        }),
      );
      expect(result.packages).toEqual([
        { name: 'vim', summary: '', repository: '' },
      ]);
      expect(result.groups).toEqual([
        {
          name: 'base',
          description: '',
          repository: '',
          package_list: [],
        },
      ]);
      expect(result.verifiedLocaleLangpacks).toEqual(['langpacks-en']);
      expect(result.repositories.customRepositories).toEqual([
        { id: 'r1', name: 'R1', baseurl: ['https://example.com'] },
      ]);
      expect(result.enabledModules).toEqual([{ name: 'nodejs', stream: '18' }]);
    });

    describe('snapshot date fallback', () => {
      it('uses blueprint snapshot_date when present', () => {
        const result = parseContentFromRequest(
          createMinimalExport({
            snapshot_date: '2025-06-15T00:00:00Z',
          }),
        );
        expect(result.snapshotting.snapshotDate).toBe('2025-06-15T00:00:00Z');
        expect(result.snapshotting.useLatest).toBe(false);
      });

      it('normalizes DateOnly blueprint snapshot_date to RFC3339', () => {
        const result = parseContentFromRequest(
          createMinimalExport({
            snapshot_date: '2025-06-15',
          }),
        );
        expect(result.snapshotting.snapshotDate).toBe('2025-06-15T00:00:00Z');
      });

      it('ignores invalid blueprint snapshot_date', () => {
        const result = parseContentFromRequest(
          createMinimalExport({
            snapshot_date: 'not-a-date',
          }),
        );
        expect(result.snapshotting.snapshotDate).toBe('');
        expect(result.snapshotting.useLatest).toBe(true);
      });

      it('defaults to useLatest when no snapshot_date', () => {
        const result = parseContentFromRequest(createMinimalExport());
        expect(result.snapshotting.snapshotDate).toBe('');
        expect(result.snapshotting.useLatest).toBe(true);
      });
    });
  });
});
