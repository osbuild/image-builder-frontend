import { describe, expect, it } from 'vitest';

import {
  BlueprintExportResponse,
  BlueprintMetadata,
  BlueprintResponse,
  Distributions,
} from '@/store/api/backend';

import { parseDetailsFromRequest } from '../parsers';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'my-blueprint',
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
    parent_id: 'parent-456',
    exported_at: '2025-06-15T00:00:00Z',
    is_on_prem: false,
  },
  ...overrides,
});

describe('parseDetailsFromRequest', () => {
  describe('edit mode (BlueprintResponse)', () => {
    it('sets mode to edit', () => {
      const result = parseDetailsFromRequest(createMinimalBlueprint());
      expect(result.mode).toBe('edit');
    });

    it('sets blueprintId from response id', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({ id: 'bp-999' }),
      );
      expect(result.blueprintId).toBe('bp-999');
    });

    it('maps blueprint name', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({ name: 'my-blueprint' }),
      );
      expect(result.blueprint.name).toBe('my-blueprint');
    });

    it('maps blueprint description', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({ description: 'A description' }),
      );
      expect(result.blueprint.description).toBe('A description');
    });

    it('defaults name to empty string when undefined', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({ name: '' }),
      );
      expect(result.blueprint.name).toBe('');
    });

    it('defaults description to empty string when undefined', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({ description: '' }),
      );
      expect(result.blueprint.description).toBe('');
    });

    it('sets isCustomName to true', () => {
      const result = parseDetailsFromRequest(createMinimalBlueprint());
      expect(result.blueprint.isCustomName).toBe(true);
    });

    it('sets blueprint mode to image when bootc is present', () => {
      const result = parseDetailsFromRequest(
        createMinimalBlueprint({
          bootc: { reference: 'quay.io/org/image:latest' },
        }),
      );
      expect(result.blueprint.mode).toBe('image');
    });

    it('sets blueprint mode to package when bootc is absent', () => {
      const result = parseDetailsFromRequest(createMinimalBlueprint());
      expect(result.blueprint.mode).toBe('package');
    });

    it('does not include metadata', () => {
      const result = parseDetailsFromRequest(createMinimalBlueprint());
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('import mode (BlueprintExportResponse)', () => {
    it('sets mode to create', () => {
      const result = parseDetailsFromRequest(createMinimalExport());
      expect(result.mode).toBe('create');
    });

    it('does not set blueprintId', () => {
      const result = parseDetailsFromRequest(createMinimalExport());
      expect(result.blueprintId).toBeUndefined();
    });

    it('maps blueprint name', () => {
      const result = parseDetailsFromRequest(
        createMinimalExport({ name: 'imported-bp' }),
      );
      expect(result.blueprint.name).toBe('imported-bp');
    });

    it('maps blueprint description', () => {
      const result = parseDetailsFromRequest(
        createMinimalExport({ description: 'Imported description' }),
      );
      expect(result.blueprint.description).toBe('Imported description');
    });

    it('sets isCustomName to true', () => {
      const result = parseDetailsFromRequest(createMinimalExport());
      expect(result.blueprint.isCustomName).toBe(true);
    });

    it('sets blueprint mode to image when bootc is present', () => {
      const result = parseDetailsFromRequest(
        createMinimalExport({
          bootc: { reference: 'quay.io/org/image:latest' },
        }),
      );
      expect(result.blueprint.mode).toBe('image');
    });

    it('sets blueprint mode to package when bootc is absent', () => {
      const result = parseDetailsFromRequest(createMinimalExport());
      expect(result.blueprint.mode).toBe('package');
    });

    describe('metadata', () => {
      it('parses metadata with all fields', () => {
        const result = parseDetailsFromRequest(
          createMinimalExport({
            metadata: {
              parent_id: 'parent-123',
              exported_at: '2025-06-15T12:00:00Z',
              is_on_prem: true,
            },
          }),
        );
        expect(result.metadata).toEqual({
          parent_id: 'parent-123',
          exported_at: '2025-06-15T12:00:00Z',
          is_on_prem: true,
        });
      });

      it('defaults parent_id to null when falsy', () => {
        const result = parseDetailsFromRequest(
          createMinimalExport({
            metadata: {
              parent_id: null,
              exported_at: '2025-06-15T00:00:00Z',
              is_on_prem: false,
            },
          }),
        );
        expect(result.metadata?.parent_id).toBeNull();
      });

      it('defaults exported_at to empty string when falsy', () => {
        const result = parseDetailsFromRequest(
          createMinimalExport({
            metadata: {
              parent_id: null,
              exported_at: '',
              is_on_prem: false,
            },
          }),
        );
        expect(result.metadata?.exported_at).toBe('');
      });

      it('defaults is_on_prem to false when falsy', () => {
        const result = parseDetailsFromRequest(
          createMinimalExport({
            metadata: {
              parent_id: null,
              exported_at: '',
              is_on_prem: false,
            },
          }),
        );
        expect(result.metadata?.is_on_prem).toBe(false);
      });

      it('handles missing metadata gracefully', () => {
        const result = parseDetailsFromRequest(
          createMinimalExport({
            metadata: undefined as unknown as BlueprintMetadata,
          }),
        );
        expect(result.metadata).toEqual({
          parent_id: null,
          exported_at: '',
          is_on_prem: false,
        });
      });
    });
  });
});
