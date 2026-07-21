import { describe, expect, it } from 'vitest';

import {
  AARCH64,
  CENTOS_9,
  RHEL_10,
  RHEL_8,
  RHEL_9,
  X86_64,
} from '@/constants';
import {
  BlueprintExportResponse,
  BlueprintResponse,
  Distributions,
  ImageRequest,
} from '@/store/api/backend';

import { parseOutputFromRequest } from '../parsers';
import { initialState } from '../state';

const baseImageRequest: ImageRequest = {
  architecture: X86_64,
  image_type: 'guest-image',
  upload_request: { type: 'aws.s3', options: {} },
};

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: RHEL_9 as Distributions,
  customizations: {},
  image_requests: [baseImageRequest],
  ...overrides,
});

const createMinimalExport = (
  overrides: Partial<BlueprintExportResponse> = {},
): BlueprintExportResponse => ({
  name: 'exported-blueprint',
  description: 'An exported blueprint',
  distribution: RHEL_9 as Distributions,
  customizations: {},
  metadata: {
    parent_id: null,
    exported_at: '',
    is_on_prem: false,
  },
  ...overrides,
});

describe('parseOutputFromRequest', () => {
  describe('edit mode (BlueprintResponse)', () => {
    it('returns expected defaults for a minimal request', () => {
      const result = parseOutputFromRequest(createMinimalBlueprint());
      expect(result).toEqual({
        architecture: X86_64,
        distribution: RHEL_9,
        imageSource: undefined,
        imageSourceType: 'official',
        isoPayloadReference: undefined,
        imageTypes: ['guest-image'],
        bootcDistributions: [],
      });
    });

    describe('architecture', () => {
      it('extracts x86_64 from first image request', () => {
        const result = parseOutputFromRequest(createMinimalBlueprint());
        expect(result.architecture).toBe(X86_64);
      });

      it('extracts aarch64 from first image request', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            image_requests: [{ ...baseImageRequest, architecture: AARCH64 }],
          }),
        );
        expect(result.architecture).toBe(AARCH64);
      });

      it('falls back to initial state architecture when image_requests is empty', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({ image_requests: [] }),
        );
        expect(result.architecture).toBe(initialState.architecture);
      });
    });

    describe('distribution', () => {
      it('normalizes rhel-9 point release to rhel-9', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            distribution: 'rhel-9.2' as Distributions,
          }),
        );
        expect(result.distribution).toBe(RHEL_9);
      });

      it('normalizes rhel-8 point release to rhel-8', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            distribution: 'rhel-8.9' as Distributions,
          }),
        );
        expect(result.distribution).toBe(RHEL_8);
      });

      it('normalizes rhel-10 point release to rhel-10', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            distribution: 'rhel-10.1' as Distributions,
          }),
        );
        expect(result.distribution).toBe(RHEL_10);
      });

      it('maps centos-8 to centos-9', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            distribution: 'centos-8' as Distributions,
          }),
        );
        expect(result.distribution).toBe(CENTOS_9);
      });

      it('passes through centos-9 unchanged', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            distribution: CENTOS_9 as Distributions,
          }),
        );
        expect(result.distribution).toBe(CENTOS_9);
      });

      it('falls back to initial state distribution when undefined', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({ distribution: undefined }),
        );
        expect(result.distribution).toBe(initialState.distribution);
      });
    });

    describe('imageSource', () => {
      it('maps image source from bootc reference', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            bootc: { reference: 'quay.io/org/image:latest' },
          }),
        );
        expect(result.imageSource).toBe('quay.io/org/image:latest');
      });

      it('returns undefined when bootc is absent', () => {
        const result = parseOutputFromRequest(createMinimalBlueprint());
        expect(result.imageSource).toBeUndefined();
      });
    });

    describe('isoPayloadReference', () => {
      it('maps ISO payload reference from bootc', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            bootc: {
              reference: 'quay.io/org/image:latest',
              iso_payload_reference: 'quay.io/org/payload:latest',
            },
          }),
        );
        expect(result.isoPayloadReference).toBe('quay.io/org/payload:latest');
      });

      it('returns undefined when bootc has no iso_payload_reference', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            bootc: { reference: 'quay.io/org/image:latest' },
          }),
        );
        expect(result.isoPayloadReference).toBeUndefined();
      });

      it('returns undefined when bootc is absent', () => {
        const result = parseOutputFromRequest(createMinimalBlueprint());
        expect(result.isoPayloadReference).toBeUndefined();
      });
    });

    describe('imageTypes', () => {
      it('extracts supported image types', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            image_requests: [
              baseImageRequest,
              { ...baseImageRequest, image_type: 'aws' },
              { ...baseImageRequest, image_type: 'vsphere' },
            ],
          }),
        );
        expect(result.imageTypes).toEqual(['guest-image', 'aws', 'vsphere']);
      });

      it('filters out edge types', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            image_requests: [
              baseImageRequest,
              { ...baseImageRequest, image_type: 'edge-commit' },
              { ...baseImageRequest, image_type: 'edge-installer' },
              { ...baseImageRequest, image_type: 'rhel-edge-commit' },
              { ...baseImageRequest, image_type: 'rhel-edge-installer' },
            ],
          }),
        );
        expect(result.imageTypes).toEqual(['guest-image']);
      });

      it('returns empty array when all types are edge types', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            image_requests: [
              { ...baseImageRequest, image_type: 'edge-commit' },
              { ...baseImageRequest, image_type: 'edge-installer' },
            ],
          }),
        );
        expect(result.imageTypes).toEqual([]);
      });

      it('returns empty array when no image requests', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({ image_requests: [] }),
        );
        expect(result.imageTypes).toEqual([]);
      });
    });

    describe('bootcDistributions', () => {
      it('always returns empty array', () => {
        const result = parseOutputFromRequest(
          createMinimalBlueprint({
            bootc: { reference: 'quay.io/org/image:latest' },
          }),
        );
        expect(result.bootcDistributions).toEqual([]);
      });
    });
  });

  describe('import mode (BlueprintExportResponse)', () => {
    it('defaults architecture to initial state', () => {
      const result = parseOutputFromRequest(createMinimalExport());
      expect(result.architecture).toBe(initialState.architecture);
    });

    it('defaults imageTypes to initial state', () => {
      const result = parseOutputFromRequest(createMinimalExport());
      expect(result.imageTypes).toEqual(initialState.imageTypes);
    });

    it('parses distribution', () => {
      const result = parseOutputFromRequest(
        createMinimalExport({
          distribution: 'rhel-9.2' as Distributions,
        }),
      );
      expect(result.distribution).toBe(RHEL_9);
    });

    it('parses bootc fields', () => {
      const result = parseOutputFromRequest(
        createMinimalExport({
          bootc: {
            reference: 'quay.io/org/image:latest',
            iso_payload_reference: 'quay.io/org/payload:latest',
          },
        }),
      );
      expect(result.imageSource).toBe('quay.io/org/image:latest');
      expect(result.isoPayloadReference).toBe('quay.io/org/payload:latest');
    });
  });
});
