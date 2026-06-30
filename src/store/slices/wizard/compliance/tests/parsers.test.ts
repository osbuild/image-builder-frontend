import { describe, expect, it } from 'vitest';

import {
  BlueprintResponse,
  Customizations,
  Distributions,
} from '@/store/api/backend';

import { parseComplianceFromRequest } from '../parsers';
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

const withCustomizations = (customizations: Customizations) =>
  createMinimalBlueprint({ customizations });

describe('parseComplianceFromRequest', () => {
  it('returns initial state for empty customizations', () => {
    const result = parseComplianceFromRequest(withCustomizations({}));
    expect(result).toEqual(initialState);
  });

  describe('compliance type', () => {
    it('returns none when openscap is not provided', () => {
      const result = parseComplianceFromRequest(withCustomizations({}));
      expect(result.type).toBe('none');
      expect(result.policyID).toBeUndefined();
      expect(result.profileID).toBeUndefined();
      expect(result.policyTitle).toBeUndefined();
    });

    it('returns openscap type when profile_id is present', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: {
            profile_id: 'xccdf_org.ssgproject.content_profile_cis' as const,
          },
        }),
      );
      expect(result.type).toBe('openscap');
      expect(result.profileID).toBe('xccdf_org.ssgproject.content_profile_cis');
      expect(result.policyID).toBeUndefined();
      expect(result.policyTitle).toBeUndefined();
    });

    it('returns compliance type when policy_id is present', () => {
      const policyId = 'abc-123-def-456';
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: { policy_id: policyId },
        }),
      );
      expect(result.type).toBe('compliance');
      expect(result.policyID).toBe(policyId);
      expect(result.profileID).toBeUndefined();
      expect(result.policyTitle).toBeUndefined();
    });

    it('returns none when openscap has empty profile_id', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: { profile_id: '' },
        }),
      );
      expect(result.type).toBe('none');
      expect(result.profileID).toBeUndefined();
    });

    it('returns none when openscap has empty policy_id', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: { policy_id: '' },
        }),
      );
      expect(result.type).toBe('none');
      expect(result.policyID).toBeUndefined();
    });
  });

  describe('fips', () => {
    it('defaults fips to disabled when not provided', () => {
      const result = parseComplianceFromRequest(withCustomizations({}));
      expect(result.fips.enabled).toBe(false);
    });

    it('maps fips enabled', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({ fips: { enabled: true } }),
      );
      expect(result.fips.enabled).toBe(true);
    });

    it('maps fips disabled explicitly', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({ fips: { enabled: false } }),
      );
      expect(result.fips.enabled).toBe(false);
    });

    it('defaults fips to disabled when fips object has no enabled field', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({ fips: {} }),
      );
      expect(result.fips.enabled).toBe(false);
    });

    it('parses fips independently from openscap profile', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: {
            profile_id: 'xccdf_org.ssgproject.content_profile_stig' as const,
          },
          fips: { enabled: true },
        }),
      );
      expect(result.type).toBe('openscap');
      expect(result.profileID).toBe(
        'xccdf_org.ssgproject.content_profile_stig',
      );
      expect(result.fips.enabled).toBe(true);
    });

    it('parses fips independently from compliance policy', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({
          openscap: { policy_id: 'policy-789' },
          fips: { enabled: true },
        }),
      );
      expect(result.type).toBe('compliance');
      expect(result.policyID).toBe('policy-789');
      expect(result.fips.enabled).toBe(true);
    });

    it('parses fips with no openscap', () => {
      const result = parseComplianceFromRequest(
        withCustomizations({ fips: { enabled: true } }),
      );
      expect(result.type).toBe('none');
      expect(result.fips.enabled).toBe(true);
    });
  });
});
